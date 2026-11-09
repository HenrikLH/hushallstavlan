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
#   POST /ha           {"app": id, "gor": "start"|"paus"|"hem"|"stopp", "rum": [16, 17]} | {"app": id, "sug"|"lage"|"vatten"|"prog"|"rutin": värde}   dammsugare och diskmaskin
#   POST /ha/val       {"rumnr": 16, "rumnamn": "Kök"} namnger robotens rum
#   POST /ha/val       {"lagg": id} | {"ta": id} | {"id": id, "namn": "Taklampa", "rum": "Kök"}   ändrar tavlans lista i HA_FIL
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
import glob, json, os, re, signal, subprocess, threading, time, http.server

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
import urllib.request
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
        lampor.append(l)
    for e in c['scener']:
        if e in alla: scener.append({'id': e, 'n': c['namn'].get(e) or namn(e, alla[e]), 'hn': namn(e, alla[e])})
    for e in c['givare']:
        x = alla.get(e)
        if x: givare.append({'id': e, 'n': c['namn'].get(e) or namn(e, x), 'hn': namn(e, x), 'rum': c['rum'].get(e), 'v': x.get('state'), 'u': (x.get('attributes') or {}).get('unit_of_measurement')})
    return {'lampor': lampor, 'scener': scener, 'givare': givare, 'apparater': ha_appar(c, alla)}

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
    lage = hitta('select', lambda k, a: 'vac_and_mop' in (a.get('options') or []))
    vatten = hitta('select', lambda k, a: 'low' in (a.get('options') or []) and 'high' in (a.get('options') or []))
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
         'pct': ha_tal(pct.get('state')) if pct else None, 'yta': ha_tal(yta.get('state')) if yta else None, 'min': ha_tal(tid.get('state')) if tid else None,
         'rumNr': rumnu.get('state') if rumnu else None, 'fel': fel.get('state') if fel and fel.get('state') not in ('none', 'unknown') else None,
         'sug': va.get('fan_speed'), 'sugAlt': va.get('fan_speed_list') or [],
         'lage': lage.get('state') if lage else None, 'lageAlt': A(lage).get('options') if lage else [], 'lageId': lage and lage['entity_id'],
         'vatten': vatten.get('state') if vatten else None, 'vattenAlt': A(vatten).get('options') if vatten else [], 'vattenId': vatten and vatten['entity_id'],
         'und': und, 'senast': max(senast) if senast else None, 'rutiner': rut, 'rum': []}
    k = ha_karta_info(alla, p)
    if k:
        a = A(k); r['karta'] = k['entity_id']; r['kartaV'] = k.get('state')
        rn = c.get('rumnamn') or {}
        try:
            f = ha_pixel(a['calibration_points']) if a.get('calibration_points') else None
            for nr, q in sorted((a.get('rooms') or {}).items(), key=lambda t: int(t[0])):
                rum = {'id': int(nr), 'n': rn.get(str(nr)) or (q.get('name') if q.get('name') not in (None, 'Unknown') else None)}
                if f:
                    x0, y0 = f(q['x0'], q['y0']); x1, y1 = f(q['x1'], q['y1'])
                    rum['b'] = [round(min(x0, x1)), round(min(y0, y1)), round(max(x0, x1)), round(max(y0, y1))]
                r['rum'].append(rum)
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
            rum = [int(x) for x in d.get('rum') or [] if any(r['id'] == int(x) for r in a['rum'])]
            if rum: tj('vacuum', 'send_command', {'entity_id': e, 'command': 'app_segment_clean', 'params': [{'segments': rum, 'repeat': 1}]})
            else: tj('vacuum', 'start', {'entity_id': e})
        elif g == 'paus': tj('vacuum', 'pause', {'entity_id': e})
        elif g == 'hem': tj('vacuum', 'return_to_base', {'entity_id': e})
        elif d.get('sug') in a['sugAlt']: tj('vacuum', 'set_fan_speed', {'entity_id': e, 'fan_speed': d['sug']})
        elif d.get('lage') in a['lageAlt']: tj('select', 'select_option', {'entity_id': a['lageId'], 'option': d['lage']})
        elif d.get('vatten') in a['vattenAlt']: tj('select', 'select_option', {'entity_id': a['vattenId'], 'option': d['vatten']})
        elif d.get('rutin') in [r['id'] for r in a['rutiner']]: tj('button', 'press', {'entity_id': d['rutin']})
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
    while True:
        if time.time() - HA['fragad'] < 60: ha_uppdatera()
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
        if e not in c['lampor'] + c['scener'] + c['givare']: return 403, {'fel': 'enheten finns inte på tavlan'}
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
    if d.get('scen'):
        e = str(d['scen'])
        if e not in c['scener']: return 403, {'fel': 'scenen är inte vald för tavlan'}
        ha_anrop(c, '/api/services/%s/turn_on' % e.split('.')[0], {'entity_id': e})
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
        if self.path.split('?')[0] in ('/ha', '/ha/val'):
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får styra hemmet'})
            try:
                n = int(self.headers.get('Content-Length') or 0)
                kod, svar = (ha_val if self.path.split('?')[0] == '/ha/val' else ha_styr)(json.loads(self.rfile.read(min(n, 1000)) or b'{}'))
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
http.server.ThreadingHTTPServer(('127.0.0.1', 8777), H).serve_forever()
