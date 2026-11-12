#!/usr/bin/env python3
# Ljustjänst för Hushållstavlan på väggdatorn.
#   GET  /lux          -> {"lux": 9.4}
#   GET  /ljusstyrka   -> {"procent": 10.0, "mal": 10.0, "normal": 60.0, "styrs": false}
#   POST /ljusstyrka   {"procent": 35}   tonar skärmens riktiga ljusstyrka dit på ~1 s
#   POST /ljusstyrka   {"normal": true}  tillbaka till normal ljusstyrka
#   POST /puls                           tavlan har just ritat en bild (skickas var 20:e sekund)
#   GET  /ha?v=N       -> lampor, scener och givare från Home Assistant; väntar upp till 25 s på en ändring om N är aktuell
#   POST /ha           {"id": "light.kok", "gor": "vaxla"|"pa"|"av", "b": 1-100, "k": kelvin, "hs": [nyans, mättnad]} | {"scen": "scene.kvall"} | {"alla": "av"}
#   GET  /ha/alla      -> enheter i HA som tavlan får lägga till (lampor, brytare, fläktar, scener, temperatur/fukt)
#   GET  /ha/karta?id=vacuum.x -> robotens kartbild (png)
#   POST /ha           {"app": id, "gor": "start"|"paus"|"hem"|"stopp"|"tom"|"tvatt"|"tvattstopp", "rum": [16, 17]}
#                      | {"app": id, "gor": "start", "damm": [16], "mopp": [16, 17]}  dammsuger först, moppar när roboten är hemma igen ("planstopp" hoppar över)
#                      | {"app": id, "zon": [x0, y0, x1, y1] (kartans pixlar)}
#                      | {"app": id, "sug"|"lage"|"vatten"|"rutt"|"prog"|"rutin"|"rot"|"dockLage": värde}   dammsugare och diskmaskin
#   POST /ha           {"media": ["media_player.kok"], "gor": "spela", "kanal": "p4", "vol": 35} | {"media": [...], "gor": "vol"|"paus"|"fortsatt"|"stopp"|"nasta"|"forra"}
#                      | {"scen": "script.ensam_hemma", "var": {"kanal": "p4", "volym": 35, "hogtalare": ["media_player.kok"]}}
#                      kanal = inbyggt id eller egen {"n": "Lugnt", "rb": "namn att söka" | "url": "https://…" | "sp": "spotify:playlist:…"}
#   POST /ha/val       {"rumnr": 16, "rumnamn": "Kök"} namnger robotens rum | {"rumnr": 16, "stor": true} stort rum (dammsugs ensamt, töms efteråt)
#   POST /ha/val       {"lagg": id} | {"ta": id} | {"id": id, "namn": "Taklampa", "rum": "Kök"}   ändrar tavlans lista i HA_FIL
#   GET  /ha/vanor?id= -> inlärd ton per kvart (vardag "v", helg "h"), säker eller inte, paus
#   POST /ha/vanor     {"id": id, "auto": true|false} | {"id": id, "ateruppta": 1} | {"id": id, "anvand": 1} | {"pauslage": "slack"|"1"|"3"}
# Home Assistant (smart hem): nyckeln ligger bara i HA_FIL (chmod 600) och lämnar aldrig datorn. Tavlan ser bara de
# lampor, scener och givare som står i filen och kan bara tända, släcka, dimma, byta färg och starta scener. Utan filen svarar /ha 503.
# Vakthund: Chromium på väggdatorn kan fastna med en grå/svart sida (renderaren väntar på GPU-processen, som har tappat
# sitt delade minne) utan att krascha. Har tavlan skickat puls någon gång men tystnat i VAKT_TYST sekunder medan
# kioskfönstret finns kvar, startas tavlan om med samma kommando som vid inloggning. Stänger man tavlan finns ingen
# process kvar och vakten gör ingenting. Avstängd tills den första pulsen kommit (äldre appversioner skickar ingen).
# Säkerhet: bara tavlans egen sida får ändra ljusstyrkan, aldrig under MIN_PROCENT, och hör tavlan
# inte av sig på LEASE sekunder går skärmen tillbaka till normal ljusstyrka (så den aldrig fastnar mörk).
# Installera: kopiera till ~/.local/bin/ljussensor.py och ljussensor.service till ~/.config/systemd/user/,
# kör sedan: systemctl --user daemon-reload && systemctl --user enable --now ljussensor
import datetime, glob, json, os, re, signal, subprocess, threading, time, http.server

TILLATNA = {'https://henriklh.github.io'} | set(filter(None, os.environ.get('HT_TILLATNA', '').split()))
MIN_PROCENT = 1.0
LEASE = 120
TONING = 1.0
BL = (glob.glob('/sys/class/backlight/*') or [None])[0]
NORMAL_FIL = os.path.expanduser('~/.config/hushallstavlan-ljus.json')
VAKT_FIL = os.path.expanduser('~/.config/hushallstavlan-vakt.json')
AUTOSTART = os.path.expanduser('~/.config/autostart/hushallstavlan.desktop')
VAKT_TYST = 60
HA_FIL = os.path.expanduser('~/.config/hushallstavlan-ha.json')

def las_lux():
    for d in glob.glob('/sys/bus/iio/devices/iio:device*'):
        try:
            if open(d + '/name').read().strip() != 'als':
                continue
            raw = float(open(d + '/in_illuminance_raw').read())
            try: skala = float(open(d + '/in_illuminance_scale').read())
            except OSError: skala = 1.0
            try: offset = float(open(d + '/in_illuminance_offset').read())
            except OSError: offset = 0.0
            return round((raw + offset) * skala, 2)
        except OSError:
            continue
    return None

def bl_max():
    return int(open(BL + '/max_brightness').read())

def bl_las():
    return int(open(BL + '/brightness').read()) / bl_max() * 100

def bl_satt(procent):
    v = max(1, round(procent / 100 * bl_max()))
    subprocess.run(['busctl', 'call', 'org.freedesktop.login1', '/org/freedesktop/login1/session/auto',
                    'org.freedesktop.login1.Session', 'SetBrightness', 'ssu', 'backlight', os.path.basename(BL), str(v)],
                   check=True, capture_output=True, timeout=5)

def las_normal():
    try: return float(json.load(open(NORMAL_FIL))['normal'])
    except Exception: return None

TILL = {'mal': None, 'senast': 0.0, 'normal': None}
NYTT = threading.Event()
TONA_MOT = {'v': None}

def tona(mal):
    # bara det senaste målet gäller: en toning som pågår byter riktning direkt i stället för att ställa sig i kö
    TONA_MOT['v'] = mal
    NYTT.set()

def tonare():
    while True:
        NYTT.wait()
        NYTT.clear()
        mal = TONA_MOT['v']
        if mal is None:
            continue
        try:
            start = bl_las()
            steg = max(1, int(TONING * 10))
            for i in range(1, steg + 1):
                if NYTT.is_set():
                    break
                bl_satt(start + (mal - start) * i / steg)
                time.sleep(TONING / steg)
        except Exception:
            pass

def vakt():
    while True:
        time.sleep(5)
        if TILL['mal'] is not None and time.time() - TILL['senast'] > LEASE:
            TILL['mal'] = None
            tona(TILL['normal'])

PULS = {'senast': 0.0, 'pids': None, 'sedan': time.time(), 'omstarter': []}

def logg(t):
    print(time.strftime('%H:%M:%S'), t, flush=True)

def vakt_aktiv():
    try: return bool(json.load(open(VAKT_FIL)).get('aktiv'))
    except Exception: return False

def kiosk_pids():
    # webbläsarens huvudprocess för tavlan: chromium med --kiosk och utan --type= (renderare, GPU m.fl. har --type)
    ut = []
    for d in glob.glob('/proc/[0-9]*/cmdline'):
        # Chromium skriver om sin kommandorad till en enda sträng med mellanslag, så dela på både \0 och mellanslag
        try: a = open(d, 'rb').read().replace(b'\0', b' ').split()
        except OSError: continue
        if a and b'chrom' in os.path.basename(a[0]) and b'--kiosk' in a and not any(x.startswith(b'--type=') for x in a):
            ut.append(int(d.split('/')[2]))
    return sorted(ut)

def starta_om_tavlan(pids):
    try: cmd = re.search(r'^Exec=(.*)$', open(AUTOSTART).read(), re.M).group(1)
    except Exception: return logg('vakt: hittar inte ' + AUTOSTART)
    cmd = re.sub(r'sleep \d+; *', '', cmd)
    if cmd.startswith("sh -c '") and cmd.endswith("'"): cmd = cmd[7:-1]
    for p in pids:
        try: os.kill(p, signal.SIGTERM)
        except OSError: pass
    for _ in range(20):
        time.sleep(0.5)
        if not kiosk_pids(): break
    for p in kiosk_pids():
        try: os.kill(p, signal.SIGKILL)
        except OSError: pass
    time.sleep(2)
    env = ['--setenv=DISPLAY=' + os.environ.get('DISPLAY', ':0'),
           '--setenv=XAUTHORITY=' + os.environ.get('XAUTHORITY', os.path.expanduser('~/.Xauthority'))]
    # egen enhet, så att tavlan inte stängs om ljustjänsten startas om
    subprocess.run(['systemd-run', '--user', '--collect', '--quiet'] + env + ['sh', '-c', cmd], timeout=15)

def vakthund():
    while True:
        time.sleep(15)
        try:
            pids = kiosk_pids()
            if pids != PULS['pids']:
                PULS['pids'] = pids; PULS['sedan'] = time.time()
            if not pids or not vakt_aktiv():
                if vakt_aktiv() and time.time() - PULS['senast'] > VAKT_TYST and not PULS.get('sagt'):
                    PULS['sagt'] = 1; logg('vakt: ingen puls, men hittar inget kioskfönster att starta om')
                continue
            PULS['sagt'] = 0
            nu = time.time()
            if nu - max(PULS['senast'], PULS['sedan']) < VAKT_TYST:
                continue
            # högst tre omstarter i timmen, så att ett fel som inte går över inte ger en evig loop
            PULS['omstarter'] = [t for t in PULS['omstarter'] if nu - t < 3600]
            if len(PULS['omstarter']) >= 3:
                continue
            PULS['omstarter'].append(nu)
            logg('vakt: ingen puls från tavlan på %d s, startar om den' % (nu - max(PULS['senast'], PULS['sedan'])))
            starta_om_tavlan(pids)
            PULS['pids'] = None
        except Exception as e:
            logg('vakt: fel ' + repr(e))


# ---- Home Assistant ----
# HA_FIL: {"url": "http://127.0.0.1:8123", "token": "<långlivad token för en HA-användare som inte är admin>",
#          "lampor": ["light.kok", "switch.fonster"], "scener": ["scene.kvall"], "givare": ["sensor.inne_temperatur"]}
# Tjänsten frågar HA en gång i sekunden så länge tavlan visar rutan (har frågat senaste minuten).
import urllib.request, urllib.parse
HA = {'v': 0, 'data': None, 'fel': None, 'fragad': 0, 'cfg': None, 'mtid': None}
HA_VILLKOR = threading.Condition()
STYRBARA = ('light', 'switch', 'fan', 'input_boolean')

def ha_cfg():
    try:
        m = os.path.getmtime(HA_FIL)
        if HA['mtid'] != m:
            c = json.load(open(HA_FIL))
            if not c.get('token'): raise ValueError('token saknas')
            c.setdefault('url', 'http://127.0.0.1:8123')
            for k in ('lampor', 'scener', 'givare'): c[k] = [str(x) for x in c.get(k) or []]
            for k in ('namn', 'rum'): c[k] = {str(a): str(b) for a, b in (c.get(k) or {}).items()}
            HA['cfg'], HA['mtid'] = c, m
        return HA['cfg']
    except FileNotFoundError:
        HA['cfg'] = HA['mtid'] = None; return None

def ha_anrop(c, vag, data=None):
    r = urllib.request.Request(c['url'].rstrip('/') + vag, method='POST' if data is not None else 'GET',
                               data=json.dumps(data).encode() if data is not None else None,
                               headers={'Authorization': 'Bearer ' + c['token'], 'Content-Type': 'application/json'})
    with urllib.request.urlopen(r, timeout=5) as svar:
        return json.loads(svar.read() or b'null')

def ha_las(c):
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    namn = lambda e, x: (x.get('attributes') or {}).get('friendly_name') or e
    lampor, scener, givare = [], [], []
    for e in c['lampor']:
        x = alla.get(e)
        if not x: continue
        a, pa = x.get('attributes') or {}, x.get('state') == 'on'
        l = {'id': e, 'n': c['namn'].get(e) or namn(e, x), 'hn': namn(e, x), 'rum': c['rum'].get(e), 't': e.split('.')[0], 'on': pa, 'nas': x.get('state') == 'unavailable',
             'b': round((a.get('brightness') or 0) / 2.55) if pa and a.get('brightness') else None}
        if l['t'] == 'light':
            # vad lampan klarar: dimmer, färgtemperatur (kelvin) och/eller färg (nyans/mättnad)
            l.update({'lagen': a.get('supported_color_modes') or [], 'lage': a.get('color_mode'), 'k': a.get('color_temp_kelvin'),
                      'kmin': a.get('min_color_temp_kelvin'), 'kmax': a.get('max_color_temp_kelvin'), 'hs': a.get('hs_color')})
            try: l['vana'] = vanor_info(e, time.time(), a)
            except Exception as fel: logg('vanor: ' + repr(fel)[:150])
        lampor.append(l)
    for e in c['scener']:
        if e in alla: scener.append({'id': e, 'n': c['namn'].get(e) or namn(e, alla[e]), 'hn': namn(e, alla[e])})
    for e in c['givare']:
        x = alla.get(e)
        if x: givare.append({'id': e, 'n': c['namn'].get(e) or namn(e, x), 'hn': namn(e, x), 'rum': c['rum'].get(e), 'v': x.get('state'), 'u': (x.get('attributes') or {}).get('unit_of_measurement')})
    falt = ha_skript_falt(c)
    for s in scener:
        f = [x for x in falt.get(s['id']) or [] if x in MEDIA_FALT]
        if f: s['falt'] = f
    return {'lampor': lampor, 'scener': scener, 'givare': givare, 'apparater': ha_appar(c, alla), 'media': ha_hogtalare(c, alla),
            'kanaler': [{'id': k['id'], 'n': k['n'], 'typ': k.get('typ') or 'Radio'} for k in kanaler(c)], 'spotify': 'spotcast' in ha_tjanster(c) or bool(ha_spotify_spelare(alla))}

# Apparater: robotdammsugare (Roborock) och diskmaskin (Home Connect). Hittas själva bland HA:s entiteter; "apparater" i
# HA_FIL kan ange egna (vacuum.x / prefixet för diskmaskinen). Entiteternas namn är på svenska i HA, så de känns igen
# på sina val (options), enheter och klasser i stället för på namnen. Tavlan får bara starta, pausa, skicka hem,
# städa valda rum, byta lägen, trycka på robotens rutiner och starta/stoppa diskprogram.
def ha_hitta_appar(c, alla):
    egna = c.get('apparater')
    rob = [e for e in alla if e.startswith('vacuum.')]
    disk = sorted({e.split('.')[1].rsplit('_', 2)[0] for e, x in alla.items() if e.startswith('select.')
                   and any(str(o).startswith('dishcare_dishwasher_program') for o in (x.get('attributes') or {}).get('options') or [])})
    if egna is not None:
        rob = [e for e in rob if e in egna]; disk = [p for p in disk if p in egna]
    return rob, disk

def ha_grupp(alla, p):
    return {e: x for e, x in alla.items() if e.split('.', 1)[1].startswith(p + '_') or e.split('.', 1)[1] == p}

def ha_tal(v):
    try: return float(v)
    except (TypeError, ValueError): return None

def ha_karta_info(alla, p):
    # bild från RoborockCustomMap (rum och kalibrering) i första hand, annars den vanliga kartbilden
    bilder = [x for e, x in alla.items() if e.startswith('image.')]
    for x in bilder:
        a = x.get('attributes') or {}
        if a.get('rooms') and a.get('calibration_points'): return x
    for x in bilder:
        if p in x['entity_id'] or 'roborock' in x['entity_id']: return x
    return None

def ha_pixel(cal):
    # tre punkter: robotens koordinater -> bildens pixlar (affin avbildning)
    (a, b, c3) = [(q['vacuum']['x'], q['vacuum']['y'], q['map']['x'], q['map']['y']) for q in cal[:3]]
    dx1, dy1, dx2, dy2 = b[0] - a[0], b[1] - a[1], c3[0] - a[0], c3[1] - a[1]
    det = dx1 * dy2 - dx2 * dy1
    def f(x, y):
        u = ((x - a[0]) * dy2 - (y - a[1]) * dx2) / det; v = ((y - a[1]) * dx1 - (x - a[0]) * dy1) / det
        return (a[2] + u * (b[2] - a[2]) + v * (c3[2] - a[2]), a[3] + u * (b[3] - a[3]) + v * (c3[3] - a[3]))
    return f

def ha_robot(c, alla, e):
    p = e.split('.', 1)[1]; G = ha_grupp(alla, p); v = alla[e]; va = v.get('attributes') or {}
    A = lambda x: x.get('attributes') or {}
    def hitta(dom, test):
        return next((x for k, x in G.items() if k.startswith(dom + '.') and test(k, A(x))), None)
    st = hitta('sensor', lambda k, a: 'segment_cleaning' in (a.get('options') or []))
    bat = hitta('sensor', lambda k, a: a.get('device_class') == 'battery')
    pct = hitta('sensor', lambda k, a: a.get('unit_of_measurement') == '%' and a.get('device_class') != 'battery')
    yta = hitta('sensor', lambda k, a: a.get('unit_of_measurement') == 'm²' and 'total' not in k)
    tid = hitta('sensor', lambda k, a: a.get('unit_of_measurement') == 'min' and a.get('device_class') == 'duration')
    rumnu = hitta('sensor', lambda k, a: a.get('device_class') == 'enum' and not a.get('options'))
    fel = hitta('sensor', lambda k, a: 'lidar_blocked' in (a.get('options') or []))
    brist = next((x for k, x in sorted(G.items()) if k.startswith('binary_sensor.') and re.search('water_shortage|vattenbrist|vatten_brist|clean_water', k)), None)
    lage = hitta('select', lambda k, a: 'vac_and_mop' in (a.get('options') or []))
    vatten = hitta('select', lambda k, a: 'low' in (a.get('options') or []) and 'high' in (a.get('options') or []))
    rutt = hitta('select', lambda k, a: 'deep' in (a.get('options') or []) and 'standard' in (a.get('options') or []))
    und = []
    for k, x in sorted(G.items()):
        a = A(x)
        if k.startswith('sensor.') and a.get('unit_of_measurement') == 'h' and 'total' not in k and ha_tal(x.get('state')) is not None:
            und.append({'n': a.get('friendly_name', k), 'h': round(ha_tal(x['state']), 1), 'k': k})
    senast = [x.get('state') for k, x in G.items() if k.startswith('sensor.') and A(x).get('device_class') == 'timestamp' and x.get('state') not in (None, 'unknown', 'unavailable')]
    bort = lambda n: re.sub('^' + re.escape(va.get('friendly_name') or p) + r'\s+', '', n or '')
    for u in und: u['n'] = bort(u['n'])
    rut = [{'id': k, 'n': bort(A(x).get('friendly_name', k))} for k, x in sorted(G.items()) if k.startswith('button.') and not re.search(r'reset|aterstall|nollst|fel|error', k)]
    r = {'id': e, 'typ': 'robot', 'n': c['namn'].get(e) or 'Dammsugaren', 'hn': va.get('friendly_name'), 'vst': v.get('state'),
         'st': st.get('state') if st else v.get('state'), 'bat': ha_tal(bat.get('state')) if bat else va.get('battery_level'),
         'pct': ha_tal(pct.get('state')) if pct else None, 'pctK': next((k for k, x in G.items() if x is pct), ''), 'yta': ha_tal(yta.get('state')) if yta else None, 'min': ha_tal(tid.get('state')) if tid else None,
         'rumNr': rumnu.get('state') if rumnu else None, 'fel': fel.get('state') if fel and fel.get('state') not in ('none', 'unknown') else None,
         'sug': va.get('fan_speed'), 'sugAlt': va.get('fan_speed_list') or [],
         'lage': lage.get('state') if lage else None, 'lageAlt': A(lage).get('options') if lage else [], 'lageId': lage and lage['entity_id'],
         'vatten': vatten.get('state') if vatten else None, 'vattenAlt': A(vatten).get('options') if vatten else [], 'vattenId': vatten and vatten['entity_id'],
         'rutt': rutt.get('state') if rutt else None, 'ruttAlt': A(rutt).get('options') if rutt else [], 'ruttId': rutt and rutt['entity_id'],
         'und': und, 'senast': max(senast) if senast else None, 'rutiner': rut, 'rum': [],
         'vbrist': (brist.get('state') == 'on') if brist and brist.get('state') in ('on', 'off') else None}
    # kartans rotation (RoborockCustomMap) och dockan (egna entiteter med "dock" i namnet)
    rot = next((x for e2, x in sorted(alla.items()) if e2.startswith('select.') and 'rotation' in e2), None)
    if rot: r.update(rot=rot.get('state'), rotAlt=A(rot).get('options') or [], rotId=rot['entity_id'])
    D = {e2: x for e2, x in alla.items() if 'dock' in e2.split('.', 1)[1] and ('roborock' in e2 or p in e2)}
    dl = next((x for e2, x in sorted(D.items()) if e2.startswith('select.')), None)
    if dl: r.update(dockLage=dl.get('state'), dockLageAlt=A(dl).get('options') or [], dockLageId=dl['entity_id'])
    dn = lambda x: re.sub(r'^.*?dock(an)?\s+', '', A(x).get('friendly_name') or x['entity_id'], flags=re.I)
    # på engelska som i Roborock-appen
    en = lambda e2, x: 'Clean water tank empty' if re.search(r'rent|clean_water', e2) else 'Dirty water tank full' if re.search(r'smuts|dirty', e2) else dn(x)
    r['dockVarn'] = [en(e2, x) for e2, x in sorted(D.items()) if e2.startswith('binary_sensor.') and x.get('state') == 'on' and A(x).get('device_class') == 'problem']
    r['dockVarn'] += ['Dock error: ' + x['state'].replace('_', ' ') for e2, x in sorted(D.items()) if e2.startswith('sensor.') and A(x).get('device_class') == 'enum' and x.get('state') not in (None, 'ok', 'none', 'unknown', 'unavailable', 'no_error', 'idle')]
    r['dock'] = bool(D)
    # mopptorkning (pågår + timmar kvar) och dockans sil (timmar kvar till byte, negativt = försenat)
    tal = lambda x: ha_tal(x.get('state'))
    tk = next((x for e2, x in sorted(D.items()) if e2.startswith('binary_sensor.') and re.search(r'tork|dry', e2)), None)
    if tk and tk.get('state') in ('on', 'off'): r['dockTork'] = tk['state'] == 'on'
    th = next((x for e2, x in sorted(D.items()) if e2.startswith('sensor.') and re.search(r'tork|dry', e2)), None)
    if th and tal(th) is not None: r['dockTorkH'] = tal(th)
    sil = next((x for e2, x in sorted(D.items()) if e2.startswith('sensor.') and re.search(r'sil|strainer', e2)), None)
    if sil and tal(sil) is not None: r['dockSil'] = tal(sil)
    # dockans egen givare för rent vatten (tom = på); går den från tom till inte tom är tanken påfylld
    rv = [x for e2, x in sorted(D.items()) if e2.startswith('binary_sensor.') and re.search(r'rent|clean_water|water_shortage|vattenbrist', e2) and x.get('state') in ('on', 'off')]
    if rv: r['vbrist'] = any(x['state'] == 'on' for x in rv)
    if any(e2.startswith('sensor.') and x.get('state') in ('water_empty', 'clean_water_tank_empty') for e2, x in D.items()): r['vbrist'] = True
    if 'mop' in r['lageAlt']: r['tank'] = ha_tank_info(c, r['vbrist'])
    if e in PLAN:
        q = PLAN[e]; r['plan'] = {'steg': q['steg'], 'i': q['i'], 'klara': q['klara'], 'nu': q['nu'], 'hemma': not q.get('avbr') and (bool(q['hemma']) or (q['sett'] and v.get('state') == 'docked')), 'klar': bool(q['klar']), 'avbr': bool(q.get('avbr'))}
    k = ha_karta_info(alla, p)
    if k:
        a = A(k); r['karta'] = k['entity_id']; r['kartaV'] = k.get('state')
        rn = c.get('rumnamn') or {}
        try:
            f = ha_pixel(a['calibration_points']) if a.get('calibration_points') else None
            for nr, q in sorted((a.get('rooms') or {}).items(), key=lambda t: int(t[0])):
                rum = {'id': int(nr), 'n': rn.get(str(nr)) or (q.get('name') if q.get('name') not in (None, 'Unknown') else None)}
                st_ = (c.get('stora') or {}).get(str(nr))
                rum['stor'] = st_ if st_ is not None else bool(re.search('vardagsrum|sovrum', (rum['n'] or '').lower()))
                sd, iv = (c.get('stadat') or {}).get(str(nr)) or {}, (c.get('intervall') or {}).get(str(nr)) or {}
                rum.update(sv=sd.get('v'), sm=sd.get('m'), iv=iv.get('v', 3), im=iv.get('m', 7))
                try: rum['m2'] = round(abs(q['x1'] - q['x0']) * abs(q['y1'] - q['y0']) / 1e6 * .75, 1)   # rektangeln runt rummet, ungefär tre fjärdedelar golv
                except Exception: pass
                if f:
                    x0, y0 = f(q['x0'], q['y0']); x1, y1 = f(q['x1'], q['y1'])
                    rum['b'] = [round(min(x0, x1)), round(min(y0, y1)), round(max(x0, x1)), round(max(y0, y1))]
                r['rum'].append(rum)
            dp = c.get('dockpos')
            if f and dp: r['dockPx'] = [round(v) for v in f(dp[0], dp[1])]   # dockans plats i kartbilden (för en effektiv rumsordning)
        except Exception as ex:
            logg('ha karta: ' + repr(ex)[:200])
    return r

DISK_PROG = {'eco_50': 'Eco 50°', 'auto_1': 'Auto 35–45°', 'auto_2': 'Auto 45–65°', 'auto_3': 'Auto 65–75°', 'intensiv_70': 'Intensiv 70°',
             'quick_45': 'Snabb 45°', 'quick_65': 'Snabb 65°', 'pre_rinse': 'Förskölj', 'night_wash': 'Natt', 'machine_care': 'Maskinvård',
             'glas_40': 'Glas 40°', 'kurz_60': 'Kort 60°', 'express_sparkle_65': 'Express 65°'}

def ha_disk(c, alla, p):
    G = ha_grupp(alla, p); A = lambda x: x.get('attributes') or {}
    def hitta(dom, test):
        return next((x for k, x in sorted(G.items()) if k.startswith(dom + '.') and test(k, A(x))), None)
    valt = hitta('select', lambda k, a: 'valt' in k or 'selected' in k) or hitta('select', lambda k, a: any(str(o).startswith('dishcare_dishwasher_program') for o in a.get('options') or []))
    aktiv = hitta('select', lambda k, a: 'aktiv' in k or 'active' in k)
    drift = hitta('sensor', lambda k, a: 'finished' in (a.get('options') or []))
    dorr = hitta('sensor', lambda k, a: 'open' in (a.get('options') or []) and 'closed' in (a.get('options') or []))
    fram = hitta('sensor', lambda k, a: a.get('unit_of_measurement') == '%')
    slut = hitta('sensor', lambda k, a: a.get('device_class') == 'timestamp')
    salt = hitta('sensor', lambda k, a: 'salt' in k)
    spol = hitta('sensor', lambda k, a: 'present' in (a.get('options') or []) and 'salt' not in k)
    fjarr = hitta('binary_sensor', lambda k, a: 'fjarrstart' in k or 'remote_start' in k)
    stopp = hitta('button', lambda k, a: 'stopp' in k or 'stop' in k)
    kort = lambda o: DISK_PROG.get(str(o).replace('dishcare_dishwasher_program_', ''), str(o).replace('dishcare_dishwasher_program_', '').replace('_', ' ').capitalize())
    s = lambda x: x.get('state') if x and x.get('state') not in ('unknown', 'unavailable') else None
    pv = s(aktiv) or s(valt)
    return {'id': p, 'typ': 'disk', 'n': c['namn'].get(p) or 'Diskmaskinen', 'st': s(drift), 'prog': kort(pv) if pv else None, 'progId': pv,
            'progAlt': [[o, kort(o)] for o in A(valt).get('options') or []] if valt else [], 'pct': ha_tal(s(fram)), 'slut': s(slut),
            'dorr': s(dorr), 'salt': s(salt) in ('present', 'confirmed') if salt else None, 'spol': s(spol) in ('present', 'confirmed') if spol else None,
            'fjarr': (fjarr or {}).get('state') == 'on' if fjarr else None, 'kanStoppa': bool(stopp)}

def ha_appar(c, alla):
    rob, disk = ha_hitta_appar(c, alla)
    ut = []
    for e in rob:
        try: ut.append(ha_robot(c, alla, e))
        except Exception as ex: logg('ha robot: ' + repr(ex)[:200])
    for p in disk:
        try: ut.append(ha_disk(c, alla, p))
        except Exception as ex: logg('ha disk: ' + repr(ex)[:200])
    return ut

def ha_app_styr(c, d):
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    a = next((x for x in ha_appar(c, alla) if x['id'] == d.get('app')), None)
    if not a: return 403, {'fel': 'apparaten finns inte'}
    tj = lambda dom, s, data: ha_anrop(c, '/api/services/%s/%s' % (dom, s), data)
    g = d.get('gor')
    if a['typ'] == 'robot':
        e = a['id']
        if g == 'start':
            ok = lambda L: [int(x) for x in L or [] if any(r['id'] == int(x) for r in a['rum'])]
            rum, damm, mopp = ok(d.get('rum')), ok(d.get('damm')), ok(d.get('mopp'))
            if rum or damm or mopp: PLAN.pop(e, None)
            if (damm or mopp) and a.get('lageId') and {'vacuum', 'mop'} <= set(a['lageAlt']):
                # alla rum dammsugs först, sedan moppas mopprummen: andra körningen startas av ha_plan när roboten är hemma
                # dockan tömmer mellan omgångarna
                stor = {x['id'] for x in a['rum'] if x.get('stor')}
                steg = []   # i den ordning rummen valdes: små rum i följd blir en omgång, ett stort rum en egen
                # ×2/×3 per rum: Roborock har bara ett antal per körning, så ett sådant rum får en egen omgång
                X = {int(k): max(1, min(3, int(v))) for k, v in (d.get('x') or {}).items() if str(k).isdigit() and str(v).isdigit()}
                # en omgång samlar rum tills ett stort rum är med eller ytan når TOM_M2: då töms behållaren (små rum före ett stort följer med i dess omgång)
                M2 = {x['id']: x.get('m2') or 0 for x in a['rum']}; oppen, yta = False, 0
                for x in damm:
                    n = X.get(x, 1)
                    if n > 1: steg.append({'typ': 'damm', 'rum': [x], 'x': n}); oppen = False; continue
                    if oppen: steg[-1]['rum'].append(x)
                    else: steg.append({'typ': 'damm', 'rum': [x]}); yta = 0
                    yta += M2.get(x, 0); oppen = not (x in stor or yta >= TOM_M2)
                # en liten sista omgång följer med den förra i stället för att ge en egen tömning
                if len(steg) > 1 and not steg[-1].get('x') and not steg[-2].get('x') and not set(steg[-1]['rum']) & stor and sum(M2.get(x, 0) for x in steg[-1]['rum']) < TOM_M2 / 2:
                    steg[-2]['rum'] += steg.pop()['rum']
                steg = steg + [{'typ': 'mopp', 'rum': mopp}] * bool(mopp)
                PLAN[e] = {'steg': steg, 'i': 0, 'klara': [[] for _ in steg], 'nu': None, 'sett': False, 'tid': time.time(), 'hemma': None, 'klar': None}
                PLAN[e]['val'] = {'sug': a.get('sug'), 'vatten': a.get('vatten'), 'rutt': a.get('rutt')}
                ha_plan_kor(c, a, 'vacuum' if damm else 'mop', steg[0]['rum'], PLAN[e]['val'], steg[0].get('x', 1))
            elif rum or damm or mopp: ha_plan_kor(c, a, None, rum or damm or mopp)
            else: tj('vacuum', 'start', {'entity_id': e})
        elif g == 'planstopp':   # hoppa över resten efter steget som pågår
            p = PLAN.get(e)
            if p and not p['klar']: del p['steg'][p['i'] + 1:]; del p['klara'][p['i'] + 1:]
        elif g == 'paus': tj('vacuum', 'pause', {'entity_id': e})
        elif g in ('tom', 'tvatt', 'tvattstopp'):
            tj('vacuum', 'send_command', {'entity_id': e, 'command': {'tom': 'app_start_collect_dust', 'tvatt': 'app_start_wash', 'tvattstopp': 'app_stop_wash'}[g]})
        elif d.get('zon'):
            # zonen kommer i kartbildens pixlar; räknas om till robotens koordinater med samma kalibrering som rummen
            k = ha_karta_info(alla, e.split('.', 1)[1]); cal = (k.get('attributes') or {}).get('calibration_points') if k else None
            if not cal: return 400, {'fel': 'kartan saknar kalibrering'}
            f = ha_pixel([{'vacuum': q['map'], 'map': q['vacuum']} for q in cal])
            x0, y0, x1, y1 = [float(v) for v in d['zon'][:4]]
            (a0, b0), (a1, b1) = f(x0, y0), f(x1, y1)
            z = [round(min(a0, a1)), round(min(b0, b1)), round(max(a0, a1)), round(max(b0, b1))]
            if z[2] - z[0] < 300 or z[3] - z[1] < 300: return 400, {'fel': 'zonen är för liten'}
            PLAN.pop(e, None); tj('vacuum', 'send_command', {'entity_id': e, 'command': 'app_zoned_clean', 'params': [z + [1]]})
        elif g == 'hem': ha_plan_stopp(e); tj('vacuum', 'return_to_base', {'entity_id': e})
        elif d.get('sug') in a['sugAlt']: tj('vacuum', 'set_fan_speed', {'entity_id': e, 'fan_speed': d['sug']})
        elif d.get('lage') in a['lageAlt']: tj('select', 'select_option', {'entity_id': a['lageId'], 'option': d['lage']})
        elif d.get('rutt') in a['ruttAlt']: tj('select', 'select_option', {'entity_id': a['ruttId'], 'option': d['rutt']})
        elif d.get('vatten') in a['vattenAlt']: tj('select', 'select_option', {'entity_id': a['vattenId'], 'option': d['vatten']})
        elif d.get('rutin') in [r['id'] for r in a['rutiner']]: PLAN.pop(e, None); tj('button', 'press', {'entity_id': d['rutin']})
        elif a.get('rotId') and d.get('rot') in a.get('rotAlt', []): tj('select', 'select_option', {'entity_id': a['rotId'], 'option': d['rot']})
        elif a.get('dockLageId') and d.get('dockLage') in a.get('dockLageAlt', []): tj('select', 'select_option', {'entity_id': a['dockLageId'], 'option': d['dockLage']})
        else: return 400, {'fel': 'okänd begäran'}
    else:
        G = ha_grupp(alla, a['id'])
        sel = lambda ord_: next((k for k in sorted(G) if k.startswith('select.') and any(o in k for o in ord_)), None)
        if g == 'start':
            prog = d.get('prog') or a['progId']
            if prog not in [o for o, n in a['progAlt']]: return 400, {'fel': 'okänt program'}
            if not a['fjarr']: return 409, {'fel': 'Tryck på fjärrstart på diskmaskinen först'}
            tj('select', 'select_option', {'entity_id': sel(('aktiv', 'active')), 'option': prog})
        elif g == 'stopp':
            b = next((k for k in sorted(G) if k.startswith('button.') and ('stopp' in k or 'stop' in k)), None)
            if not b: return 400, {'fel': 'kan inte stoppas'}
            tj('button', 'press', {'entity_id': b})
        elif d.get('prog') in [o for o, n in a['progAlt']]:
            tj('select', 'select_option', {'entity_id': sel(('valt', 'selected')), 'option': d['prog']})
        else: return 400, {'fel': 'okänd begäran'}
    ha_uppdatera()
    return 200, {'ok': True, 'v': HA['v']}

# Högtalare och radio: Google Home/Nest-högtalarna finns i HA som media_player (integrationen Google Cast). Tavlan får
# bara spela kanalerna i KANALER (eller "kanaler" i HA_FIL), ändra volym, pausa och stoppa. "hogtalare" i HA_FIL
# begränsar vilka media_player som syns; utan den syns alla. Kanalens ljudadress slås upp på väggdatorn (Sveriges
# Radios API respektive radio-browser.info) och sparas en dag, så att en flyttad ström hittas igen av sig själv.
KANALER = [
    {'id': 'megapol', 'n': 'Mix Megapol', 'typ': 'Radio', 'rb': 'Mix Megapol'},
    {'id': 'p3', 'n': 'P3', 'typ': 'Radio', 'sr': 'P3'},
    {'id': 'nrj', 'n': 'NRJ', 'typ': 'Radio', 'rb': 'NRJ'},
    {'id': 'p1', 'n': 'P1', 'typ': 'Radio', 'sr': 'P1'},
    {'id': 'p4', 'n': 'P4 Jönköping', 'typ': 'Radio', 'sr': 'P4 Jönköping'},
]
KANAL_URL, KANAL_NU = {}, {}   # id -> (url, bild, tid);  media_player -> (kanalens id, starttid) medan den spelar

def kanaler(c):
    egna = [k for k in c.get('kanaler') or [] if isinstance(k, dict) and k.get('id') and k.get('n') and (k.get('url') or k.get('sr') or k.get('rb'))]
    return egna or KANALER

def kanal_hamta(url):
    r = urllib.request.Request(url, headers={'User-Agent': 'Hushallstavlan/1.0'})
    with urllib.request.urlopen(r, timeout=6) as svar: return json.loads(svar.read())

SPOTIFY = re.compile(r'^spotify:(playlist|album|artist|track|show|episode):[A-Za-z0-9]{10,40}$')

def kanal_fran(c, v):
    # en inbyggd kanal (id) eller en egen från appen: {"n": namn, "url": https-adress | "rb": namn att söka | "sp": spotify-uri}
    if isinstance(v, str): return next((k for k in kanaler(c) if k['id'] == v), None)
    if not isinstance(v, dict): return None
    n = str(v.get('n') or '').strip()[:60]
    if v.get('sp') and SPOTIFY.match(str(v['sp'])): return {'id': str(v['sp']), 'n': n or 'Spotify', 'sp': str(v['sp'])}
    if v.get('url') and re.match(r'^https?://[^\s]{4,400}$', str(v['url'])): return {'id': str(v['url']), 'n': n or 'Ljud', 'url': str(v['url'])}
    if v.get('rb'): q = str(v['rb']).strip()[:60]; return {'id': 'rb:' + q.lower(), 'n': n or q, 'rb': q} if q else None
    return None

def kanal_url(k):
    if k.get('url'): return k['url'], k.get('bild')
    g = KANAL_URL.get(k['id'])
    if g and time.time() - g[2] < 86400: return g[0], g[1]
    url = bild = None
    try:
        if k.get('sr'):
            for x in kanal_hamta('https://api.sr.se/api/v2/channels?format=json&pagination=false').get('channels') or []:
                if x.get('name', '').lower() == k['sr'].lower():
                    url, bild = (x.get('liveaudio') or {}).get('url'), x.get('image'); break
        else:
            q = urllib.parse.urlencode({'name': k['rb'], 'countrycode': k.get('land', 'SE'), 'hidebroken': 'true', 'order': 'clickcount', 'reverse': 'true', 'limit': 5})
            L = kanal_hamta('https://all.api.radio-browser.info/json/stations/search?' + q)
            if not L:   # inget svenskt namn som stämmer: sök i hela världen
                L = kanal_hamta('https://all.api.radio-browser.info/json/stations/search?' + urllib.parse.urlencode({'name': k['rb'], 'hidebroken': 'true', 'order': 'clickcount', 'reverse': 'true', 'limit': 5}))
            x = next((x for x in L if x.get('name', '').strip().lower() == k['rb'].lower()), L[0] if L else None)
            if x: url, bild = x.get('url_resolved') or x.get('url'), x.get('favicon') or None
    except Exception as e:
        logg('kanal %s: %s' % (k['id'], repr(e)[:150]))
    if not url:
        if g: return g[0], g[1]   # gammal adress hellre än ingen
        return None, None
    KANAL_URL[k['id']] = (url, bild, time.time())
    return url, bild

def ha_hogtalare(c, alla):
    egna = c.get('hogtalare')
    # Spotify-kontots egen spelare (media_player.spotify_*) är ingen högtalare; det som castas syns på högtalaren själv
    ids = [e for e in (egna if egna is not None else sorted(alla)) if e.startswith('media_player.') and e in alla and not e.startswith('media_player.spotify')]
    ut = []
    for e in ids:
        x = alla[e]; a = x.get('attributes') or {}; st = x.get('state')
        if st not in ('playing', 'buffering', 'paused') and time.time() - (KANAL_NU.get(e) or ('', 0))[1] > 20: KANAL_NU.pop(e, None)
        v, f = a.get('volume_level'), int(a.get('supported_features') or 0)
        ut.append({'id': e, 'n': c['namn'].get(e) or a.get('friendly_name') or e, 'hn': a.get('friendly_name') or e, 'rum': c['rum'].get(e),
                   'st': st, 'nas': st == 'unavailable', 'vol': round(v * 100) if isinstance(v, (int, float)) else None,
                   'titel': a.get('media_title'), 'artist': a.get('media_artist') or a.get('media_album_artist'), 'app': a.get('app_name'),
                   'kan': {'f': bool(f & 16), 'n': bool(f & 32)}, 'kanal': (KANAL_NU.get(e) or (None,))[0], 'grupp': len(a.get('group_members') or []) > 1})
    return ut

def ha_hog_ok(c, L):
    alla = {x['entity_id'] for x in ha_anrop(c, '/api/states')}
    egna = c.get('hogtalare')
    L = [str(e) for e in (L if isinstance(L, list) else [L]) if str(e).startswith('media_player.') and str(e) in alla]
    return [e for e in L if egna is None or e in egna]

def ha_spotify_spelare(alla):
    return next((e for e in sorted(alla) if e.startswith('media_player.spotify')), None)

def ha_spotify(c, hog, uri):
    # Spotcast (HACS) om den finns, annars HA:s vanliga Spotify-koppling: välj högtalaren som Spotify Connect-källa och spela
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    mal = hog[0]
    if len(hog) > 1:   # flera högtalare: Spotify spelar på en enhet åt gången, så ta Google-gruppen (Alla högtalare) om den finns
        mal = next((e for e in sorted(alla) if e.startswith('media_player.') and e not in hog and 'alla' in e), mal)
    if 'spotcast' in ha_tjanster(c):
        ha_anrop(c, '/api/services/spotcast/start', {'entity_id': mal, 'uri': uri, 'force_playback': True})
        return 200, {}
    sp = ha_spotify_spelare(alla)
    if not sp: return 501, {'fel': 'Koppla Spotify till Home Assistant först'}
    namn = lambda e: (alla.get(e, {}).get('attributes') or {}).get('friendly_name') or e
    kalla = namn(mal)
    L = (alla[sp].get('attributes') or {}).get('source_list') or []
    try:
        if (alla[sp].get('attributes') or {}).get('source') != kalla:
            ha_anrop(c, '/api/services/media_player/select_source', {'entity_id': sp, 'source': kalla})
            time.sleep(1.5)
        ha_anrop(c, '/api/services/media_player/play_media', {'entity_id': sp, 'media_content_id': uri, 'media_content_type': uri.split(':')[1]})
    except Exception as e:
        logg('spotify: %s källor %s: %s' % (kalla, L, repr(e)[:150]))
        return 502, {'fel': 'Spotify hittar inte ' + kalla + '. Spela något på den från Spotify-appen en gång och försök igen.'}
    return 200, {}

def ha_media_styr(c, d):
    hog = ha_hog_ok(c, d.get('media'))
    if not hog: return 403, {'fel': 'högtalaren finns inte'}
    tj = lambda s, data: ha_anrop(c, '/api/services/media_player/' + s, dict(data, entity_id=hog))
    g = d.get('gor')
    if d.get('vol') is not None and g in ('spela', 'vol'):
        tj('volume_set', {'volume_level': max(0, min(100, int(d['vol']))) / 100})
    if g == 'spela':
        k = kanal_fran(c, d.get('kanal'))
        if not k: return 400, {'fel': 'okänd kanal'}
        if k.get('sp'):
            kod, svar = ha_spotify(c, hog, k['sp'])
            if kod != 200: return kod, svar
            for e in hog: KANAL_NU[e] = (k['id'], time.time())
            ha_uppdatera()
            return 200, {'ok': True, 'v': HA['v']}
        url, bild = kanal_url(k)
        if not url: return 502, {'fel': 'Hittar inte ' + k['n'] + ' just nu'}
        extra = {'title': k['n'], 'metadata': {'metadataType': 3, 'title': k['n']}}
        if bild: extra['thumb'] = bild
        for e in hog:
            ha_anrop(c, '/api/services/media_player/play_media', {'entity_id': e, 'media_content_id': url, 'media_content_type': 'music', 'extra': extra})
            KANAL_NU[e] = (k['id'], time.time())
    elif g in ('paus', 'fortsatt', 'stopp', 'nasta', 'forra'):
        tj({'paus': 'media_pause', 'fortsatt': 'media_play', 'stopp': 'media_stop', 'nasta': 'media_next_track', 'forra': 'media_previous_track'}[g], {})
        if g == 'stopp':
            for e in hog: KANAL_NU.pop(e, None)
    elif g != 'vol': return 400, {'fel': 'gor ska vara spela, vol, paus, fortsatt, stopp, nasta eller forra'}
    ha_uppdatera()
    return 200, {'ok': True, 'v': HA['v']}

# Skript med fält (till exempel "Ensam hemma") får kanal, volym och högtalare från tavlan. Fälten läses från HA:s
# tjänstelista, så tavlan vet vilka skript som vill ha dem. Bara kända fält skickas vidare, och kanalen blir en adress här.
SKRIPT_FALT = {'t': 0, 'f': {}, 'dom': set()}
MEDIA_FALT = ('kanal_url', 'kanal_namn', 'kanal_bild', 'spotify_uri', 'volym', 'hogtalare')

def ha_tjanster(c):
    ha_skript_falt(c)
    return SKRIPT_FALT['dom']

def ha_skript_falt(c):
    if time.time() - SKRIPT_FALT['t'] > 60:
        f = {}
        try:
            L = ha_anrop(c, '/api/services') or []
            SKRIPT_FALT['dom'] = {x.get('domain') for x in L}
            for dom in L:
                if dom.get('domain') == 'script':
                    for s, x in (dom.get('services') or {}).items():
                        if s not in ('turn_on', 'turn_off', 'toggle', 'reload'): f['script.' + s] = sorted((x.get('fields') or {}).keys())
        except Exception as e: logg('ha skript: ' + repr(e)[:150])
        SKRIPT_FALT.update(t=time.time(), f=f)
    return SKRIPT_FALT['f']

def ha_skript_var(c, e, v):
    falt = set(ha_skript_falt(c).get(e) or [])
    ut = {}
    if not isinstance(v, dict): return ut
    if v.get('kanal') and 'kanal_url' in falt:
        k = kanal_fran(c, v['kanal'])
        if k and k.get('sp'): ut.update(spotify_uri=k['sp'], kanal_namn=k['n'])
        elif k:
            url, bild = kanal_url(k)
            if url: ut.update(kanal_url=url, kanal_namn=k['n'], kanal_bild=bild or '')
    if v.get('volym') is not None and 'volym' in falt: ut['volym'] = max(0, min(100, int(v['volym'])))
    if v.get('hogtalare') and 'hogtalare' in falt:
        h = ha_hog_ok(c, v['hogtalare'])
        if h: ut['hogtalare'] = h
    return {k: x for k, x in ut.items() if k in falt}

TOM_M2 = 20   # m² dammsugna rum innan behållaren töms (stora rum töms alltid efter)

# Dammsug följt av mopp (inte båda samtidigt: fukten fastnar annars i dammbehållaren). Läget sätts före varje körning
# och återställs till dammsugning efteråt, så att vanlig städning alltid är dammsugning.
PLAN = {}
def ha_plan_kor(c, a, lage, rum, val=None, ggr=1):
    tj = lambda dom, s, data: ha_anrop(c, '/api/services/%s/%s' % (dom, s), data)
    if lage and a.get('lage') != lage:
        tj('select', 'select_option', {'entity_id': a['lageId'], 'option': lage}); time.sleep(2)
        # lägesbytet kan ändra sug, vatten och rutt: sätt tillbaka det som gällde när planen startades
        v = val or {}
        if lage == 'vacuum' and v.get('sug') in a['sugAlt'] and v['sug'] != 'off': tj('vacuum', 'set_fan_speed', {'entity_id': a['id'], 'fan_speed': v['sug']})
        if lage == 'mop':
            if v.get('vatten') in a['vattenAlt'] and v['vatten'] != 'off': tj('select', 'select_option', {'entity_id': a['vattenId'], 'option': v['vatten']})
            if v.get('rutt') in a['ruttAlt']: tj('select', 'select_option', {'entity_id': a['ruttId'], 'option': v['rutt']})
        if v: time.sleep(1)
    tj('vacuum', 'send_command', {'entity_id': a['id'], 'command': 'app_segment_clean', 'params': [{'segments': rum, 'repeat': ggr}]})

def ha_plan_stopp(e):
    p = PLAN.get(e)
    if p and not p['klar']: del p['steg'][p['i']:]; del p['klara'][p['i']:]; p['klar'] = time.time()

def ha_plan_avbruten(c, e, a, varfor):
    # roboten stoppades mitt i (Roborock-appen, fel eller tidsgräns): rummen som inte hanns med visas som ej städade
    p = PLAN.get(e)
    if not p or p['klar']: return
    logg('ha: plan avbruten i steg %d (%s), klara %s' % (p['i'], varfor, p['klara'][p['i']]))
    p['avbr'], p['nu'], p['hemma'], p['klar'] = True, None, None, time.time()
    if a and a.get('lage') not in (None, 'vacuum'): ha_anrop(c, '/api/services/select/select_option', {'entity_id': a['lageId'], 'option': 'vacuum'})

def ha_plan_rum(a, v):
    # nuvarande rum: segmentnumret eller namnet (HA:s eller tavlans)
    if v is None or str(v).lower() in ('unknown', 'unavailable', 'none', ''): return None
    for r in a['rum']:
        if True and str(v).strip().lower() in (str(r['id']), (r.get('n') or '').lower(), (r.get('hn') or '').lower()): return r['id']
    return None

def ha_plan():
    c = ha_cfg()
    if not PLAN or not c: return
    nu = time.time()
    for e, p in list(PLAN.items()):   # avslutade planer visas i tre timmar
        if p['klar'] and nu - p['klar'] > 3 * 3600: PLAN.pop(e, None)
    if all(p['klar'] for p in PLAN.values()): return
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    for e, p in list(PLAN.items()):
        if p['klar']: continue
        if e not in alla: PLAN.pop(e, None); continue
        a = ha_robot(c, alla, e); vst, st = a.get('vst'), a.get('st') or ''
        steg, k = p['steg'][p['i']], p['klara'][p['i']]
        if vst == 'cleaning' or (vst != 'returning' and 'clean' in st):
            p['sett'], p['hemma'], p['paus'] = True, None, False
            if a.get('pct') is not None and re.search('progress|forlopp|framsteg', a.get('pctK') or ''): p['pct'] = a['pct']   # bara ett riktigt förloppsvärde, inte filter/borstar
            rid = ha_plan_rum(a, a.get('rumNr'))
            if rid in steg['rum']: p['sedda'] = (p.get('sedda') or []) + [rid] * (rid not in (p.get('sedda') or []))
            if rid != p['nu'] and rid is not None:   # roboten har bytt rum: förra rummet är klart (på väg hem räknas inte)
                if p['nu'] in steg['rum'] and p['nu'] not in k: k.append(p['nu']); ha_stadat(c, [p['nu']], steg['typ'])
                p['nu'] = rid
        elif p['sett'] and vst in ('idle', 'paused'):
            p['paus'] = True   # stoppad eller pausad: om den sedan åker hem utan att fortsätta är omgången avbruten
        elif p['sett'] and vst == 'returning': pass
        elif vst == 'error' or nu - p['tid'] > 4 * 3600 or (not p['sett'] and nu - p['tid'] > 600):
            ha_plan_avbruten(c, e, a, '%s, %s' % (vst, st))
        elif p['sett'] and vst == 'docked':
            if not p['hemma']:
                # avbruten i Roborock-appen? stoppad innan den åkte hem, förloppet inte fullt eller rum som aldrig besöktes
                sedda, pct = p.get('sedda') or [], p.get('pct')
                if p.get('paus') or (pct is not None and pct < 90) or (sedda and set(steg['rum']) - set(sedda)):
                    ha_plan_avbruten(c, e, a, 'paus' if p.get('paus') else 'förlopp %s%%, besökta %s' % (pct, sedda)); continue
            if not p['hemma']: ha_stadat(c, [x for x in steg['rum'] if x not in k], steg['typ'])
            k[:] = steg['rum']; p['nu'] = None
            if re.search(r'empty|wash|going', st): p['hemma'] = p['hemma'] or nu; continue
            if not p['hemma']:
                p['hemma'] = nu
                # efter en dammsugning töms behållaren alltid innan nästa omgång (dockans egen tömning kan vara av eller "smart")
                if steg['typ'] == 'damm' and p['i'] + 1 < len(p['steg']):
                    ha_anrop(c, '/api/services/vacuum/send_command', {'entity_id': e, 'command': 'app_start_collect_dust'})
            if nu - p['hemma'] < 30: continue   # låt dockan tömma klart
            if p['i'] + 1 < len(p['steg']):
                p['i'] += 1; n = p['steg'][p['i']]
                logg('ha: steg %d klart, %s %s' % (p['i'], n['typ'], n['rum']))
                ha_plan_kor(c, a, 'mop' if n['typ'] == 'mopp' else 'vacuum', n['rum'], p.get('val'), n.get('x', 1)); p.update(sett=False, tid=nu, hemma=None, sedda=[], pct=None, paus=False)
            else:
                p['i'] += 1; p['klar'] = nu
                if a.get('lage') != 'vacuum': ha_anrop(c, '/api/services/select/select_option', {'entity_id': a['lageId'], 'option': 'vacuum'})
    ha_uppdatera()

# när varje rum senast dammsögs/moppades (för påminnelser i appen) och hur mycket som moppats sedan tanken fylldes
def ha_stadat(c, rum, lage):
    typ = {'vacuum': 'v', 'mop': 'm', 'vac_and_mop': 'vm', 'custom': 'v', 'damm': 'v', 'mopp': 'm'}.get(lage, 'v')
    rum = [r for r in rum if r is not None]
    if not rum: return
    c = json.loads(json.dumps(c)); s = c.setdefault('stadat', {}); t = int(time.time())
    for r in rum:
        for x in typ: s.setdefault(str(r), {})[x] = t
    ha_spara(c)

TANK_STD = 150   # m² moppat (normalt vattenflöde) per full tank tills appen har lärt sig hur länge tanken räcker
def ha_tank_info(c, brist):
    t = c.get('tank') or {}; hist = t.get('hist') or []
    kap = sum(hist) / len(hist) if hist else TANK_STD
    m2 = t.get('m2') or 0
    return {'m2': round(m2), 'kap': round(kap), 'lart': len(hist), 'fylld': t.get('fylld'), 'brist': brist, 'senast': t.get('senast'),
            'pct': 0 if brist else max(0, min(100, round(100 * (1 - m2 / kap))))}

def ha_tank(c, h, m2=0, vatten=None):
    c = json.loads(json.dumps(c)); t = c.setdefault('tank', {}); nu = int(time.time())
    t.setdefault('m2', 0); t.setdefault('hist', [])
    if h == 'fylld':
        t.update(m2=0, fylld=nu)
    elif h == 'tom':   # dockan säger att tanken är tom: så långt räckte en tank (lärs in, de fem senaste)
        if t['m2'] > 20 and t.get('fylld'): t['hist'] = (t['hist'] + [round(t['m2'])])[-5:]
    elif h == 'mopp' and m2:
        t['m2'] = round(t['m2'] + m2 * {'low': .7, 'high': 1.3}.get(vatten, 1), 1); t['senast'] = round(m2, 1)
    ha_spara(c)

# alla körningar (även från Roborock-appen): rummen roboten lämnar räknas som städade, moppad yta dras från tanken
FOLJ = {}
nu_t = time.time
def ha_folj():
    c = ha_cfg()
    if not c: return
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    rob, _ = ha_hitta_appar(c, alla)
    for e in rob:
        if e not in alla: continue
        a = ha_robot(c, alla, e); vst = a.get('vst')
        f = FOLJ.setdefault(e, {'kor': False, 'nu': None, 'lage': None, 'paus': False, 'brist': None})
        b = a.get('vbrist')
        if b is not None and f['brist'] is not None and b != f['brist']: ha_tank(c, 'tom' if b else 'fylld'); c = ha_cfg()
        f['brist'] = b
        planen = e in PLAN and not PLAN[e]['klar']
        if vst == 'cleaning':
            if not f['kor']: f.update(kor=True, nu=None, paus=False, lage=a.get('lage'), vatten=a.get('vatten'))
            rid = ha_plan_rum(a, a.get('rumNr'))
            if rid is not None and rid != f['nu']:
                if f['nu'] is not None and not planen: ha_stadat(c, [f['nu']], f['lage']); c = ha_cfg()
                f['nu'] = rid
        elif vst in ('idle', 'paused') and f['kor']: f['paus'] = True
        if vst == 'docked' and nu_t() - (c.get('dockpos_t') or 0) > 86400:   # dockans plats: robotens position när den står i dockan (en gång per dygn)
            try:
                svar = ha_anrop(c, '/api/services/roborock/get_vacuum_current_position?return_response', {'entity_id': e}) or {}
                pos = (svar.get('service_response') or {}).get(e) or {}
                if isinstance(pos.get('x'), (int, float)) and isinstance(pos.get('y'), (int, float)):
                    c = json.loads(json.dumps(c)); c.update(dockpos=[pos['x'], pos['y']], dockpos_t=int(nu_t())); ha_spara(c); c = ha_cfg()
                else: c = json.loads(json.dumps(c)); c['dockpos_t'] = int(nu_t()); ha_spara(c); c = ha_cfg()
            except Exception as ex:
                logg('ha dockans plats: ' + repr(ex)[:150]); c = json.loads(json.dumps(c)); c['dockpos_t'] = int(nu_t()); ha_spara(c); c = ha_cfg()
        if vst == 'docked' and f['kor']:
            f['kor'] = False
            if not planen and not f['paus'] and not (e in PLAN and PLAN[e].get('avbr')): ha_stadat(c, [f['nu']], f['lage']); c = ha_cfg()
            if f['lage'] in ('mop', 'vac_and_mop'):
                yta = a.get('yta')
                if not yta: yta = sum(r.get('m2') or 0 for r in a['rum'] if r['id'] == f['nu'])
                ha_tank(c, 'mopp', yta or 0, f.get('vatten'))

KARTA = {'v': None, 'png': None, 'tid': 0}
def ha_karta(eid):
    c = ha_cfg()
    if not c: return 503, None
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    rob, _ = ha_hitta_appar(c, alla)
    k = next((ha_karta_info(alla, e.split('.', 1)[1]) for e in rob if e == eid), None)
    if not k: return 404, None
    if KARTA['v'] != (k['entity_id'], k.get('state')) or time.time() - KARTA['tid'] > 20:
        r = urllib.request.Request(c['url'].rstrip('/') + '/api/image_proxy/' + k['entity_id'], headers={'Authorization': 'Bearer ' + c['token']})
        with urllib.request.urlopen(r, timeout=8) as svar: KARTA['png'] = svar.read()
        KARTA['v'], KARTA['tid'] = (k['entity_id'], k.get('state')), time.time()
    return 200, KARTA['png']

def ha_uppdatera():
    c = ha_cfg()
    try:
        data, fel = (ha_las(c), None) if c else (None, 'inte inställt')
    except Exception as e:
        data, fel = HA['data'], 'Home Assistant svarar inte'
        logg('ha: ' + repr(e)[:200])
    with HA_VILLKOR:
        if data != HA['data'] or fel != HA['fel']:
            HA['data'], HA['fel'] = data, fel; HA['v'] += 1; HA_VILLKOR.notify_all()

def ha_bevakare():
    n = 0
    while True:
        if time.time() - HA['fragad'] < 60: ha_uppdatera()
        n += 1
        if PLAN and n % 5 == 0:
            try: ha_plan()
            except Exception as e: logg('ha plan: ' + repr(e)[:200])
        if n % 10 == 3:
            try: ha_folj()
            except Exception as e: logg('ha följ: ' + repr(e)[:200])
        time.sleep(1)

LISTA = {'light': 'lampor', 'switch': 'lampor', 'fan': 'lampor', 'input_boolean': 'lampor', 'scene': 'scener', 'script': 'scener', 'sensor': 'givare'}
GIVARTYP = ('temperature', 'humidity')

def ha_valbar(x):
    dom = x['entity_id'].split('.')[0]
    if dom not in LISTA: return False
    return dom != 'sensor' or (x.get('attributes') or {}).get('device_class') in GIVARTYP

def ha_alla():
    c = ha_cfg()
    if not c: return 503, {'fel': 'inte inställt'}
    valda = set(c['lampor'] + c['scener'] + c['givare'])
    ut = [{'id': x['entity_id'], 'n': (x.get('attributes') or {}).get('friendly_name') or x['entity_id'], 't': x['entity_id'].split('.')[0],
           'dc': (x.get('attributes') or {}).get('device_class'), 'vald': x['entity_id'] in valda}
          for x in ha_anrop(c, '/api/states') if ha_valbar(x)]
    return 200, {'alla': sorted(ut, key=lambda x: (x['t'], x['n'].lower()))}

def ha_spara(c):
    ut = {k: v for k, v in c.items()}
    tmp = HA_FIL + '.ny'
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as f: json.dump(ut, f, ensure_ascii=False, indent=1)
    os.replace(tmp, HA_FIL)
    HA['mtid'] = None

def ha_val(d):
    c = ha_cfg()
    if not c: return 503, {'fel': 'inte inställt'}
    c = json.loads(json.dumps(c))
    e = str(d.get('lagg') or d.get('ta') or d.get('id') or '')
    if 'rumnr' in d and isinstance(d.get('intervall'), dict):   # påminnelse: dammsug/moppa var n:e dag (0 = av)
        iv = c.setdefault('intervall', {}).setdefault(str(int(d['rumnr'])), {})
        for x in ('v', 'm'):
            if x in d['intervall']: iv[x] = max(0, min(60, int(d['intervall'][x])))
        ha_spara(c); ha_uppdatera(); return 200, {'ok': True, 'v': HA['v']}
    if d.get('tank') == 'fylld':
        ha_tank(c, 'fylld'); ha_uppdatera(); return 200, {'ok': True, 'v': HA['v']}
    if 'rumnr' in d and 'stor' in d:   # stort rum: dammsugs ensamt med tömning efteråt
        c.setdefault('stora', {})[str(int(d['rumnr']))] = bool(d['stor'])
        ha_spara(c); ha_uppdatera(); return 200, {'ok': True, 'v': HA['v']}
    if 'rumnr' in d:
        rn = c.setdefault('rumnamn', {}); v = str(d.get('rumnamn') or '').strip()[:30]
        if v: rn[str(int(d['rumnr']))] = v
        else: rn.pop(str(int(d['rumnr'])), None)
        ha_spara(c); ha_uppdatera(); return 200, {'ok': True, 'v': HA['v']}
    if d.get('lagg'):
        x = next((x for x in ha_anrop(c, '/api/states') if x['entity_id'] == e), None)
        if not x or not ha_valbar(x): return 403, {'fel': 'den enheten kan inte läggas på tavlan'}
        lista = c[LISTA[e.split('.')[0]]]
        if e not in lista: lista.append(e)
    elif d.get('ta'):
        for k in ('lampor', 'scener', 'givare'): c[k] = [x for x in c[k] if x != e]
        c['namn'].pop(e, None); c['rum'].pop(e, None)
    else:
        if e not in c['lampor'] + c['scener'] + c['givare'] and not e.startswith('media_player.'): return 403, {'fel': 'enheten finns inte på tavlan'}
        for k in ('namn', 'rum'):
            if k in d:
                v = str(d[k] or '').strip()[:40]
                if v: c[k][e] = v
                else: c[k].pop(e, None)
    ha_spara(c)
    ha_uppdatera()
    return 200, {'ok': True, 'v': HA['v']}

def ha_styr(d):
    c = ha_cfg()
    if not c: return 503, {'fel': 'inte inställt'}
    if d.get('app'):
        return ha_app_styr(c, d)
    if d.get('media'):
        return ha_media_styr(c, d)
    if d.get('scen'):
        e = str(d['scen'])
        if e not in c['scener']: return 403, {'fel': 'scenen är inte vald för tavlan'}
        data = {'entity_id': e}
        v0 = d.get('var') if isinstance(d.get('var'), dict) else {}
        k0 = kanal_fran(c, v0.get('kanal')) if v0.get('kanal') else None
        if k0 and k0.get('sp') and e.startswith('script.') and 'spotify_uri' in (ha_skript_falt(c).get(e) or []) and 'spotcast' not in ha_tjanster(c):
            # Spotify-lista utan Spotcast: tavlan spelar själv med volym och högtalare från bladet i stället för skriptet
            return ha_media_styr(c, {'media': v0.get('hogtalare'), 'gor': 'spela', 'kanal': v0['kanal'], 'vol': v0.get('volym')})
        if e.startswith('script.') and d.get('var'):
            v = ha_skript_var(c, e, d['var'])
            if v: data['variables'] = v
        ha_anrop(c, '/api/services/%s/turn_on' % e.split('.')[0], data)
    elif d.get('alla') == 'av':
        for e in c['lampor']:
            if e.split('.')[0] in STYRBARA: ha_anrop(c, '/api/services/%s/turn_off' % e.split('.')[0], {'entity_id': e})
    else:
        e, gor = str(d.get('id')), d.get('gor')
        dom = e.split('.')[0]
        if e not in c['lampor'] or dom not in STYRBARA: return 403, {'fel': 'lampan är inte vald för tavlan'}
        tj = {'vaxla': 'toggle', 'pa': 'turn_on', 'av': 'turn_off'}.get(gor)
        if not tj: return 400, {'fel': 'gor ska vara vaxla, pa eller av'}
        data = {'entity_id': e}
        if tj == 'turn_on' and dom == 'light':
            if d.get('b') is not None: data['brightness_pct'] = max(1, min(100, int(d['b'])))
            if d.get('k') is not None: data['color_temp_kelvin'] = max(1500, min(9000, int(d['k'])))
            elif d.get('hs') is not None:
                h, m = d['hs']; data['hs_color'] = [max(0.0, min(360.0, float(h))), max(0.0, min(100.0, float(m)))]
        ha_anrop(c, '/api/services/%s/%s' % (dom, tj), data)
    ha_uppdatera()
    return 200, {'ok': True, 'v': HA['v']}

# --- Ljusvanor: tavlan skriver upp lampornas ton (kelvin) dygnet runt, lär sig vilken ton ni brukar ha vid varje kvart
# (vardag och helg för sig) och ställer in den själv när mönstret hållit VANOR_SAKER. Ändrar någon tonen själv (i appen,
# Google Home eller med knappen) pausas just den lampan (tills den släcks, högst till kl. 04, eller 1/3 timmar). Tänder
# och släcker aldrig. Tonskalan är samma som lampkortets (haTonK/haTonCmd i app.js): kelvin med color_temp, varmare än
# kmin ned till 1500 K som hs [44-18t, s0+(100-s0)t] på färglampor.
VANOR_LOGG = os.path.expanduser('~/.config/hushallstavlan-ljusvanor.jsonl')
VANOR_FIL = os.path.expanduser('~/.config/hushallstavlan-ljusvanor.json')
VANOR_DAGAR = 28        # så långt bak den tittar
VANOR_HALV = 7.0        # en vecka gammal dag väger hälften
VANOR_SAKER = (5, 7)    # mönstret ska ha hållit 5 av de senaste 7 dagarna (samma dagtyp) innan den styr själv
VANOR_NARA = 150        # K: så nära räknas som samma ton
VANOR_GLID = 60         # s övergång när den ändrar själv (2 s när lampan just tänts)
VANOR_MIN_PA = 300      # s: lampan ska ha lyst minst så länge under en kvart för att kvarten ska räknas
VANOR = {'senast': {}, 'egna': {}, 'logg': None, 'kurvor': {}, 'styrd': 0.0, 'lock': threading.RLock()}

def ton_k(a):
    # lampans ton i kelvin, eller None om den lyser i en riktig färg (inte vitt/varmt)
    L = a.get('supported_color_modes') or []
    if a.get('color_mode') == 'color_temp' and a.get('color_temp_kelvin'): return int(a['color_temp_kelvin'])
    hs = a.get('hs_color')
    if hs and 15 <= hs[0] <= 45 and any(m in L for m in ('hs', 'xy', 'rgb', 'rgbw', 'rgbww')):
        k = 'color_temp' in L
        kmin, s0 = (a.get('min_color_temp_kelvin') or 2200, 40) if k else (4000, 0)
        t = max(0.0, min(1.0, (hs[1] - s0) / (100 - s0)))
        return int(round(kmin - t * (kmin - 1500)))
    return None

def ton_kan(a):
    L = a.get('supported_color_modes') or []
    return 'color_temp' in L or any(m in L for m in ('hs', 'xy', 'rgb', 'rgbw', 'rgbww'))

def ton_cmd(a, K):
    L = a.get('supported_color_modes') or []
    k, f = 'color_temp' in L, any(m in L for m in ('hs', 'xy', 'rgb', 'rgbw', 'rgbww'))
    kmin, kmax = a.get('min_color_temp_kelvin') or 2200, a.get('max_color_temp_kelvin') or 6500
    if k and (K >= kmin or not f): return {'color_temp_kelvin': int(max(kmin, min(kmax, K)))}
    top, s0 = (kmin, 40) if k else (4000, 0)
    t = max(0.0, min(1.0, (top - K) / (top - 1500)))
    return {'hs_color': [round(44 - 18 * t), round(s0 + (100 - s0) * t)]}

def vanor_inst():
    try: d = json.load(open(VANOR_FIL))
    except Exception: d = {}
    d.setdefault('av', []); d.setdefault('paus', {}); d.setdefault('pauslage', 'slack')
    return d

def vanor_spara_inst(d):
    tmp = VANOR_FIL + '.ny'
    with open(tmp, 'w') as f: json.dump(d, f, ensure_ascii=False)
    os.replace(tmp, VANOR_FIL)

def vanor_logg():
    with VANOR['lock']:
        if VANOR['logg'] is None:
            L = []
            try:
                for rad in open(VANOR_LOGG):
                    try: L.append(json.loads(rad))
                    except ValueError: pass
            except FileNotFoundError: pass
            VANOR['logg'] = L
            vanor_rensa(time.time())
        return VANOR['logg']

def vanor_rensa(nu):
    # spara bara VANOR_DAGAR + några dagar; skriv om filen
    with VANOR['lock']:
        gr = nu - (VANOR_DAGAR + 3) * 86400
        L = VANOR['logg'] or []
        # behåll senaste raden före gränsen per lampa, så att läget vid gränsen är känt
        sist = {}
        for r in L:
            if r['t'] < gr: sist[r['e']] = r
        ny = sorted(sist.values(), key=lambda r: r['t']) + [r for r in L if r['t'] >= gr]
        if len(ny) != len(L) or not os.path.exists(VANOR_LOGG):
            os.makedirs(os.path.dirname(VANOR_LOGG), exist_ok=True)
            tmp = VANOR_LOGG + '.ny'
            with open(tmp, 'w') as f:
                for r in ny: f.write(json.dumps(r) + '\n')
            os.replace(tmp, VANOR_LOGG)
        VANOR['logg'] = ny

def vanor_skriv(r):
    with VANOR['lock']:
        vanor_logg().append(r)
        os.makedirs(os.path.dirname(VANOR_LOGG), exist_ok=True)
        with open(VANOR_LOGG, 'a') as f: f.write(json.dumps(r) + '\n')
        VANOR['kurvor'].pop(r['e'], None)

def vanor_historik(c, lampor, nu):
    # Vid start: hämta det Home Assistant redan minns (10 dagar som standard) för lampor som tavlan bara loggat kort tid,
    # så inlärningen inte börjar från noll. Bara rader äldre än tavlans egen logg läggs till. end_time krävs: utan den
    # ger HA bara 24 timmar räknat från starttiden.
    iso = lambda t: time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(t)) + 'Z'
    forst = {}
    for r in vanor_logg(): forst[r['e']] = min(forst.get(r['e'], r['t']), r['t'])
    rader = []
    for e in lampor:
        till = forst.get(e, nu)
        if till < nu - 2 * 86400: continue
        try:
            svar = ha_anrop(c, '/api/history/period/%s?filter_entity_id=%s&end_time=%s' % (iso(nu - VANOR_DAGAR * 86400), e, iso(till)))
        except Exception as fel:
            logg('vanor: historik ' + repr(fel)[:150]); continue
        for lista in svar or []:
            for x in lista:
                try: t = datetime.datetime.fromisoformat((x.get('last_updated') or x['last_changed']).replace('Z', '+00:00')).timestamp()
                except Exception: continue
                if t >= till: continue
                a, pa = x.get('attributes') or {}, x.get('state') == 'on'
                if x.get('state') not in ('on', 'off'): continue
                rader.append({'t': round(t), 'e': x.get('entity_id') or e, 'on': int(pa), 'k': ton_k(a) if pa else None,
                              'b': round(a['brightness'] / 2.55) if pa and a.get('brightness') else None, 's': 'm'})
    if not rader: return
    with VANOR['lock']:
        L = vanor_logg(); L.extend(rader); L.sort(key=lambda r: r['t'])
        VANOR['kurvor'] = {}
        VANOR['logg'] = L
        if os.path.exists(VANOR_LOGG): os.remove(VANOR_LOGG)
        vanor_rensa(nu)
    logg('vanor: hämtade %d rader historik' % len(rader))

def dagtyp(t):
    return 'h' if time.localtime(t).tm_wday >= 5 else 'v'

# Solens upp- och nedgång för Värnamo, räknat utan internet (soluppgångsekvationen, ±2 min räcker gott)
SOL_LAT, SOL_LON = 57.186, 14.040
SOL_CACHE = {}

def sol_tider(t):
    # (upp, ned, middag) som unix-tid för det lokala datumet som t ligger i
    datum = time.strftime('%Y-%m-%d', time.localtime(t))
    if datum in SOL_CACHE: return SOL_CACHE[datum]
    import math
    t12 = time.mktime(time.strptime(datum + ' 12', '%Y-%m-%d %H'))
    n = round(t12 / 86400 + 2440587.5 - 2451545.0 + 0.0008)
    J = n - SOL_LON / 360
    M = (357.5291 + 0.98560028 * J) % 360; Mr = math.radians(M)
    C = 1.9148 * math.sin(Mr) + 0.02 * math.sin(2 * Mr) + 0.0003 * math.sin(3 * Mr)
    L = math.radians((M + C + 180 + 102.9372) % 360)
    Jt = 2451545.0 + J + 0.0053 * math.sin(Mr) - 0.0069 * math.sin(2 * L)
    d = math.asin(math.sin(L) * math.sin(math.radians(23.4397))); f = math.radians(SOL_LAT)
    c = (math.sin(math.radians(-0.833)) - math.sin(f) * math.sin(d)) / (math.cos(f) * math.cos(d))
    w = math.degrees(math.acos(max(-1.0, min(1.0, c))))
    unix = lambda jd: (jd - 2440587.5) * 86400
    SOL_CACHE[datum] = (unix(Jt - w / 360), unix(Jt + w / 360), unix(Jt))
    return SOL_CACHE[datum]

def sol_nyckel(t):
    # kvart räknat från soluppgången (förmiddag) eller solnedgången (eftermiddag och kväll): ('u', -2) = 30 min före soluppgången
    upp, ned, mid = sol_tider(t)
    return ('u', int((t - upp) // 900)) if t < mid else ('n', int((t - ned) // 900))

def vanor_skatta(P, nyckel, grannar):
    # viktad median av dagarnas ton för nyckeln (grannarna väger hälften), och hur många av de senaste 7 dagarna som stämmer
    kand = [(k, w) for (_, k, w) in P.get(nyckel, [])] + [(k, w * 0.5) for g in grannar for (_, k, w) in P.get(g, [])]
    if not kand: return None
    kand.sort(); tot = sum(w for _, w in kand); acc = 0
    for k, w in kand:
        acc += w
        if acc >= tot / 2: med = k; break
    senaste = sorted(P.get(nyckel, []), key=lambda x: x[0], reverse=True)[:VANOR_SAKER[1]]
    return med, sum(1 for (_, k, _) in senaste if abs(k - med) <= VANOR_NARA), len(P.get(nyckel, []))

def vanor_kurva(e, nu):
    # Per dagtyp (vardag/helg) lär den sig två förklaringar: efter klockan (kvart på dygnet) och efter solen (kvart före/efter
    # sol upp/ned). För varje tid väljs den som stämt bäst med era val de senaste dagarna: kvällsvärmen följer oftast mörkret,
    # läggdags oftast klockan. Kurvan gäller dagens soltider; nyare dagar väger mer, egna ändringar mer än tavlans.
    with VANOR['lock']:
        K = VANOR['kurvor'].get(e)
        if K and nu - K['t'] < 600 and time.localtime(K['t']).tm_mday == time.localtime(nu).tm_mday: return K
        rader = [r for r in vanor_logg() if r['e'] == e]
    dag = {}   # (datum, modell, nyckel) -> [summa k*s*w, summa s*w, sekunder på]
    gr = nu - VANOR_DAGAR * 86400
    for i, r in enumerate(rader):
        slut = rader[i + 1]['t'] if i + 1 < len(rader) else nu
        if not r.get('on') or not r.get('k'): continue
        a, slut = max(r['t'], gr), min(slut, nu)
        w = 0.5 if r.get('s') == 'a' else 1.0
        while a < slut:
            lt = time.localtime(a)
            grans = a - (lt.tm_min % 15) * 60 - lt.tm_sec + 900
            b = min(slut, grans); s = b - a
            if s > 0:
                datum = time.strftime('%Y-%m-%d', lt)
                for nyckel in (('k', lt.tm_hour * 4 + lt.tm_min // 15), ('s', sol_nyckel((a + b) / 2))):
                    d = dag.setdefault((datum,) + nyckel, [0.0, 0.0, 0.0])
                    d[0] += r['k'] * s * w; d[1] += s * w; d[2] += s
            a = b
    per = {'v': {'k': {}, 's': {}}, 'h': {'k': {}, 's': {}}}
    for (datum, modell, nyckel), d in dag.items():
        if d[2] < VANOR_MIN_PA or not d[1]: continue
        t0 = time.mktime(time.strptime(datum, '%Y-%m-%d')) + 43200
        per[dagtyp(t0)][modell].setdefault(nyckel, []).append((datum, d[0] / d[1], 0.5 ** (max(0, nu - t0) / 86400 / VANOR_HALV) * min(1.0, d[1] / d[2] * 2)))
    lt = time.localtime(nu); t00 = time.mktime((lt.tm_year, lt.tm_mon, lt.tm_mday, 0, 0, 0, 0, 0, -1))
    upp, ned, _ = sol_tider(nu)
    ut = {'t': nu, 'dagar': len({k[0] for k, d in dag.items() if d[2] >= VANOR_MIN_PA}),
          'sol': {'upp': round((upp - t00) / 60), 'ned': round((ned - t00) / 60)}}
    for typ, P in per.items():
        kurva, saker, n, kalla = [], [], [], []
        for kv in range(96):
            sn = sol_nyckel(t00 + kv * 900 + 450)
            alt = [(x, m) for x, m in ((vanor_skatta(P['k'], kv, ((kv - 1) % 96, (kv + 1) % 96)), 'k'),
                                       (vanor_skatta(P['s'], sn, ((sn[0], sn[1] - 1), (sn[0], sn[1] + 1))), 's')) if x]
            if not alt: kurva.append(None); saker.append(0); n.append(0); kalla.append(''); continue
            (med, traff, antal), m = max(alt, key=lambda a: (a[0][1], a[0][2], a[1] == 'k'))
            kurva.append(int(round(med / 10) * 10)); saker.append(int(traff >= VANOR_SAKER[0])); n.append(antal); kalla.append(m)
        ut[typ] = {'kurva': kurva, 'saker': saker, 'n': n, 'kalla': kalla}
    with VANOR['lock']: VANOR['kurvor'][e] = ut
    return ut

def vanor_nu(e, nu):
    K = vanor_kurva(e, nu); lt = time.localtime(nu); kv = lt.tm_hour * 4 + lt.tm_min // 15
    T = K[dagtyp(nu)]
    return {'k': T['kurva'][kv], 'saker': bool(T['saker'][kv]), 'n': T['n'][kv], 'dagar': K['dagar'], 'kalla': T['kalla'][kv]}

def vanor_pausad(e, nu, inst=None):
    p = (inst or vanor_inst())['paus'].get(e)
    return p if p and p > nu else None

def vanor_pausa(e, nu):
    inst = vanor_inst(); lage = inst.get('pauslage')
    if lage in ('1', '3'): till = nu + int(lage) * 3600
    else:
        lt = time.localtime(nu)
        till = time.mktime((lt.tm_year, lt.tm_mon, lt.tm_mday, 4, 0, 0, 0, 0, -1))
        if till <= nu: till = time.mktime((lt.tm_year, lt.tm_mon, lt.tm_mday + 1, 4, 0, 0, 0, 0, -1))
    inst['paus'][e] = round(till)
    inst['paus'] = {k: v for k, v in inst['paus'].items() if v > nu}
    vanor_spara_inst(inst)

def vanor_info(e, nu, a=None):
    # kort sammanfattning som följer med lampan i /ha
    if a is not None and not ton_kan(a): return None
    v = vanor_nu(e, nu); inst = vanor_inst()
    return {'auto': e not in inst['av'], 'k': v['k'], 'saker': v['saker'], 'n': v['n'], 'dagar': v['dagar'],
            'paus': vanor_pausad(e, nu, inst), 'pauslage': inst['pauslage']}

def vanor_satt(c, e, a, K, glid, nu):
    fran = ton_k(a)
    data = {'entity_id': e, 'transition': glid, **ton_cmd(a, K)}
    ha_anrop(c, '/api/services/light/turn_on', data)
    VANOR['egna'][e] = {'fran': fran or K, 'mal': K, 'till': nu + glid + 20}

def vanor_egen(e, k, nu):
    # är ändringen tavlans egen (pågående övergång mot målet)?
    E = VANOR['egna'].get(e)
    if not E or nu > E['till'] or k is None: return False
    lo, hi = sorted((E['fran'], E['mal']))
    return lo - VANOR_NARA / 2 <= k <= hi + VANOR_NARA / 2

def vanor_styr(c, e, a, nu, tandes=False):
    inst = vanor_inst()
    if e in inst['av'] or vanor_pausad(e, nu, inst) or not ton_kan(a): return False
    k = ton_k(a)
    if k is None: return False   # lyser i en riktig färg: rör inte
    v = vanor_nu(e, nu)
    if not v['k'] or not v['saker']: return False
    cmd = ton_cmd(a, v['k']); mal = cmd.get('color_temp_kelvin') or v['k']   # så nära lampan klarar
    if abs(k - mal) < VANOR_NARA * 2 / 3: return False
    E = VANOR['egna'].get(e)
    if E and nu <= E['till'] and E['mal'] == mal: return False
    vanor_satt(c, e, a, mal, 2 if tandes else VANOR_GLID, nu)
    return True

def vanor_varv(c, nu):
    lampor = [e for e in c['lampor'] if e.split('.')[0] == 'light']
    if not lampor: return
    alla = {x['entity_id']: x for x in ha_anrop(c, '/api/states')}
    styr = nu - VANOR['styrd'] >= 60
    if styr: VANOR['styrd'] = nu
    for e in lampor:
        x = alla.get(e)
        if not x or x.get('state') not in ('on', 'off'): continue
        a, pa = x.get('attributes') or {}, x.get('state') == 'on'
        if not ton_kan(a): continue
        k = ton_k(a) if pa else None
        b = round(a['brightness'] / 2.55) if pa and a.get('brightness') else None
        f = VANOR['senast'].get(e)
        VANOR['senast'][e] = {'on': pa, 'k': k, 'b': b}
        andrad = f is None or f['on'] != pa or (k or 0) != (f['k'] or 0) and abs((k or 0) - (f['k'] or 0)) > 50 or abs((b or 0) - (f['b'] or 0)) > 3
        if andrad:
            egen = vanor_egen(e, k, nu)
            vanor_skriv({'t': round(nu), 'e': e, 'on': int(pa), 'k': k, 'b': b, 's': 'a' if egen else 'm'})
            if f and f['on'] and pa and not egen and k and f['k'] and abs(k - f['k']) >= 100 and e not in vanor_inst()['av']:
                VANOR['egna'].pop(e, None); vanor_pausa(e, nu)   # någon ändrade tonen själv
            if f and f['on'] and not pa:
                VANOR['egna'].pop(e, None)
                inst = vanor_inst()
                if inst['pauslage'] == 'slack' and e in inst['paus']: inst['paus'].pop(e); vanor_spara_inst(inst)
            if pa and f is not None and not f['on']:
                vanor_styr(c, e, a, nu, tandes=True); continue
        if styr and pa: vanor_styr(c, e, a, nu)

def vanor_bevakare():
    forsta = True
    while True:
        try:
            c = ha_cfg()
            if c:
                if forsta: vanor_historik(c, [e for e in c['lampor'] if e.split('.')[0] == 'light'], time.time()); forsta = False
                vanor_varv(c, time.time())
                if time.localtime().tm_hour == 3 and time.localtime().tm_min < 1: vanor_rensa(time.time())
        except Exception as e:
            logg('vanor: ' + repr(e)[:200])
        time.sleep(5)

def vanor_get(e):
    c = ha_cfg()
    if not c: return 503, {'fel': 'inte inställt'}
    if e not in c['lampor']: return 403, {'fel': 'lampan är inte vald för tavlan'}
    nu = time.time(); K = vanor_kurva(e, nu); inst = vanor_inst()
    return 200, {'id': e, 'typ': dagtyp(nu), 'v': K['v'], 'h': K['h'], 'dagar': K['dagar'], 'sol': K['sol'], 'auto': e not in inst['av'],
                 'paus': vanor_pausad(e, nu, inst), 'pauslage': inst['pauslage'], 'saker': list(VANOR_SAKER)}

def vanor_post(d):
    c = ha_cfg()
    if not c: return 503, {'fel': 'inte inställt'}
    inst, nu = vanor_inst(), time.time()
    if 'pauslage' in d:
        if d['pauslage'] not in ('slack', '1', '3'): return 400, {'fel': 'pauslage ska vara slack, 1 eller 3'}
        inst['pauslage'] = d['pauslage']; vanor_spara_inst(inst)
    else:
        e = str(d.get('id') or '')
        if e not in c['lampor'] or e.split('.')[0] != 'light': return 403, {'fel': 'lampan är inte vald för tavlan'}
        if 'auto' in d:
            inst['av'] = [x for x in inst['av'] if x != e] + ([] if d['auto'] else [e])
            inst['paus'].pop(e, None); vanor_spara_inst(inst)
        elif d.get('ateruppta'):
            inst['paus'].pop(e, None); vanor_spara_inst(inst)
            x = next((x for x in ha_anrop(c, '/api/states') if x['entity_id'] == e), None)
            if x and x.get('state') == 'on': vanor_styr(c, e, x.get('attributes') or {}, nu)
        elif d.get('anvand'):
            # förslaget "Ni brukar ha … nu": ställ in som tavlans egen ändring, så det inte räknas som paus
            v = vanor_nu(e, nu)
            x = next((x for x in ha_anrop(c, '/api/states') if x['entity_id'] == e), None)
            if not v['k'] or not x or x.get('state') != 'on': return 409, {'fel': 'inget förslag just nu'}
            inst['paus'].pop(e, None); vanor_spara_inst(inst)
            vanor_satt(c, e, x.get('attributes') or {}, v['k'], 3, nu)
        else: return 400, {'fel': 'skicka auto, ateruppta, anvand eller pauslage'}
    ha_uppdatera()
    return 200, {'ok': True, 'v': HA['v']}

class H(http.server.BaseHTTPRequestHandler):
    def huvuden(self, kod):
        self.send_response(kod)
        o = self.headers.get('Origin')
        self.send_header('Access-Control-Allow-Origin', o if o in TILLATNA else '*')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Vary', 'Origin')
        self.send_header('Cache-Control', 'no-store')
    def svara(self, kod, data):
        body = json.dumps(data).encode()
        try:
            self.huvuden(kod); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass   # tavlan laddade om medan den väntade på /ha
    def do_OPTIONS(self):
        self.huvuden(204); self.end_headers()
    def status(self):
        return {'procent': round(bl_las(), 1) if BL else None, 'mal': TILL['mal'], 'normal': TILL['normal'],
                'styrs': TILL['mal'] is not None, 'min': MIN_PROCENT, 'lease': LEASE, 'avbrytbar': True}
    def do_GET(self):
        p = self.path.split('?')[0]
        if p == '/lux':
            lux = las_lux(); self.svara(200 if lux is not None else 503, {'lux': lux})
        elif p == '/ljusstyrka':
            self.svara(200 if BL else 503, self.status())
        elif p == '/ha/alla':
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får läsa hemmet'})
            try: kod, svar = ha_alla()
            except Exception as e:
                logg('ha: ' + repr(e)[:200]); kod, svar = 502, {'fel': 'Home Assistant svarade inte'}
            self.svara(kod, svar)
        elif p == '/ha/vanor':
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får läsa hemmet'})
            m = re.search(r'[?&]id=([\w.]+)', self.path)
            try: kod, svar = vanor_get(m.group(1) if m else '')
            except Exception as e:
                logg('vanor: ' + repr(e)[:200]); kod, svar = 502, {'fel': 'Home Assistant svarade inte'}
            self.svara(kod, svar)
        elif p == '/ha/karta':
            # bilden laddas av <img> (ingen Origin); den visar bara planlösningen och robotens läge
            m = re.search(r'[?&]id=([\w.]+)', self.path)
            try: kod, png = ha_karta(m.group(1) if m else '')
            except Exception as e:
                logg('ha karta: ' + repr(e)[:200]); kod, png = 502, None
            if not png: return self.svara(kod, {'fel': 'ingen karta'})
            try:
                self.huvuden(200); self.send_header('Content-Type', 'image/png'); self.end_headers(); self.wfile.write(png)
            except (BrokenPipeError, ConnectionResetError): pass
        elif p == '/ha':
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får läsa hemmet'})
            ny = time.time() - HA['fragad'] > 5
            HA['fragad'] = time.time()
            if ny: ha_uppdatera()
            m = re.search(r'[?&]v=(\d+)', self.path)
            with HA_VILLKOR:
                if m and int(m.group(1)) == HA['v']: HA_VILLKOR.wait(25)
                svar = {'v': HA['v'], 'fel': HA['fel'], **(HA['data'] or {})}
            self.svara(200 if HA['data'] else 503, svar)
        else:
            self.svara(404, {'fel': 'okänd sökväg'})
    def do_POST(self):
        if self.path.split('?')[0] == '/puls':
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får skicka puls'})
            PULS['senast'] = time.time()
            if not vakt_aktiv():
                os.makedirs(os.path.dirname(VAKT_FIL), exist_ok=True)
                json.dump({'aktiv': True}, open(VAKT_FIL, 'w'))
                logg('vakt: första pulsen, vakten är på')
            return self.svara(200, {'ok': True, 'tyst': VAKT_TYST})
        if self.path.split('?')[0] in ('/ha', '/ha/val', '/ha/vanor'):
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får styra hemmet'})
            try:
                n = int(self.headers.get('Content-Length') or 0)
                kod, svar = {'/ha/val': ha_val, '/ha/vanor': vanor_post}.get(self.path.split('?')[0], ha_styr)(json.loads(self.rfile.read(min(n, 1000)) or b'{}'))
            except Exception as e:
                logg('ha: ' + repr(e)[:200]); kod, svar = 502, {'fel': 'Home Assistant svarade inte'}
            return self.svara(kod, svar)
        if self.path.split('?')[0] != '/ljusstyrka':
            return self.svara(404, {'fel': 'okänd sökväg'})
        if self.headers.get('Origin') not in TILLATNA:
            return self.svara(403, {'fel': 'bara tavlan får ändra ljusstyrkan'})
        if not BL:
            return self.svara(503, {'fel': 'ingen skärm att styra'})
        try:
            n = int(self.headers.get('Content-Length') or 0)
            d = json.loads(self.rfile.read(min(n, 1000)) or b'{}')
            if d.get('normal'):
                TILL['mal'] = None; mal = TILL['normal']
            else:
                mal = max(MIN_PROCENT, min(100.0, float(d['procent'])))
                TILL['mal'] = mal; TILL['senast'] = time.time()
        except Exception:
            return self.svara(400, {'fel': 'skicka {"procent": 1-100} eller {"normal": true}'})
        tona(mal)
        self.svara(200, self.status())
    def log_message(self, *a): pass

if __name__ == '__main__':
    if BL:
        # Normal ljusstyrka = den skärmen hade första gången tjänsten startade (ändras genom att redigera filen)
        TILL['normal'] = las_normal()
        if TILL['normal'] is None:
            TILL['normal'] = max(MIN_PROCENT, round(bl_las(), 1))
            os.makedirs(os.path.dirname(NORMAL_FIL), exist_ok=True)
            json.dump({'normal': TILL['normal']}, open(NORMAL_FIL, 'w'))
        else:
            try: bl_satt(TILL['normal'])   # efter omstart eller krasch: börja alltid från normal ljusstyrka
            except Exception: pass
        threading.Thread(target=vakt, daemon=True).start()
        threading.Thread(target=tonare, daemon=True).start()

    threading.Thread(target=vakthund, daemon=True).start()
    threading.Thread(target=ha_bevakare, daemon=True).start()
    threading.Thread(target=vanor_bevakare, daemon=True).start()
    http.server.ThreadingHTTPServer(('127.0.0.1', 8777), H).serve_forever()
