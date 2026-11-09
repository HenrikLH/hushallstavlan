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
            try: l['vana'] = vanor_info(e, time.time(), a)
            except Exception as fel: logg('vanor: ' + repr(fel)[:150])
        lampor.append(l)
    for e in c['scener']:
        if e in alla: scener.append({'id': e, 'n': c['namn'].get(e) or namn(e, alla[e]), 'hn': namn(e, alla[e])})
    for e in c['givare']:
        x = alla.get(e)
        if x: givare.append({'id': e, 'n': c['namn'].get(e) or namn(e, x), 'hn': namn(e, x), 'rum': c['rum'].get(e), 'v': x.get('state'), 'u': (x.get('attributes') or {}).get('unit_of_measurement')})
    return {'lampor': lampor, 'scener': scener, 'givare': givare}

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
    # första gången: hämta det Home Assistant redan minns (oftast 10 dagar) så inlärningen inte börjar från noll
    har = {r['e'] for r in vanor_logg()}
    nya = [e for e in lampor if e not in har]
    if not nya: return
    fran = time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(nu - VANOR_DAGAR * 86400)) + '+00:00'
    try:
        svar = ha_anrop(c, '/api/history/period/%s?filter_entity_id=%s' % (fran, ','.join(nya)))
    except Exception as e:
        logg('vanor: historik ' + repr(e)[:150]); return
    rader = []
    for lista in svar or []:
        for x in lista:
            try: t = datetime.datetime.fromisoformat(x.get('last_updated') or x['last_changed']).timestamp()
            except Exception: continue
            a, pa = x.get('attributes') or {}, x.get('state') == 'on'
            rader.append({'t': round(t), 'e': x['entity_id'], 'on': int(pa), 'k': ton_k(a) if pa else None,
                          'b': round(a['brightness'] / 2.55) if pa and a.get('brightness') else None, 's': 'm'})
    with VANOR['lock']:
        L = vanor_logg(); L.extend(rader); L.sort(key=lambda r: r['t'])
        for e in nya: VANOR['kurvor'].pop(e, None)
        VANOR['logg'] = L
        if os.path.exists(VANOR_LOGG): os.remove(VANOR_LOGG)
        vanor_rensa(nu)
    logg('vanor: hämtade %d rader historik' % len(rader))

def dagtyp(t):
    return 'h' if time.localtime(t).tm_wday >= 5 else 'v'

def vanor_kurva(e, nu):
    # per dagtyp och kvart: den ton ni brukar ha (viktad median, nyare dagar väger mer, egna ändringar mer än tavlans),
    # om den är säker (VANOR_SAKER) och hur många dagar den bygger på
    with VANOR['lock']:
        K = VANOR['kurvor'].get(e)
        if K and nu - K['t'] < 600 and time.localtime(K['t']).tm_mday == time.localtime(nu).tm_mday: return K
        rader = [r for r in vanor_logg() if r['e'] == e]
    dag = {}   # (datum, kvart) -> [summa k*s, summa s, sekunder på, vikt efter källa]
    gr = nu - VANOR_DAGAR * 86400
    for i, r in enumerate(rader):
        slut = rader[i + 1]['t'] if i + 1 < len(rader) else nu
        if not r.get('on') or not r.get('k'): continue
        a, slut = max(r['t'], gr), min(slut, nu)
        while a < slut:
            lt = time.localtime(a)
            kv = lt.tm_hour * 4 + lt.tm_min // 15
            grans = a - (lt.tm_min % 15) * 60 - lt.tm_sec + 900
            b = min(slut, grans); s = b - a
            if s > 0:
                d = dag.setdefault((time.strftime('%Y-%m-%d', lt), kv), [0.0, 0.0, 0.0, 0.0])
                w = 0.5 if r.get('s') == 'a' else 1.0
                d[0] += r['k'] * s * w; d[1] += s * w; d[2] += s
            a = b
    idag = time.strftime('%Y-%m-%d', time.localtime(nu))
    per = {'v': [[] for _ in range(96)], 'h': [[] for _ in range(96)]}
    for (datum, kv), d in dag.items():
        if d[2] < VANOR_MIN_PA or not d[1]: continue
        t0 = time.mktime(time.strptime(datum, '%Y-%m-%d')) + 43200
        per[dagtyp(t0)][kv].append((datum, d[0] / d[1], 0.5 ** (max(0, nu - t0) / 86400 / VANOR_HALV) * min(1.0, d[1] / d[2] * 2)))
    ut = {'t': nu, 'dagar': len({datum for (datum, kv) in dag if dag[(datum, kv)][2] >= VANOR_MIN_PA})}
    for typ, P in per.items():
        kurva, saker, n = [], [], []
        for kv in range(96):
            kand = [(k, w) for (_, k, w) in P[kv]] + [(k, w * 0.5) for j in (kv - 1, (kv + 1) % 96) for (_, k, w) in P[j]]
            if not kand: kurva.append(None); saker.append(0); n.append(0); continue
            kand.sort(); tot = sum(w for _, w in kand); acc = 0
            for k, w in kand:
                acc += w
                if acc >= tot / 2: med = k; break
            senaste = sorted(P[kv], key=lambda x: x[0], reverse=True)[:VANOR_SAKER[1]]
            traff = sum(1 for (_, k, _) in senaste if abs(k - med) <= VANOR_NARA)
            kurva.append(int(round(med / 10) * 10)); saker.append(int(traff >= VANOR_SAKER[0])); n.append(len(P[kv]))
        ut[typ] = {'kurva': kurva, 'saker': saker, 'n': n}
    with VANOR['lock']: VANOR['kurvor'][e] = ut
    return ut

def vanor_nu(e, nu):
    K = vanor_kurva(e, nu); lt = time.localtime(nu); kv = lt.tm_hour * 4 + lt.tm_min // 15
    T = K[dagtyp(nu)]
    return {'k': T['kurva'][kv], 'saker': bool(T['saker'][kv]), 'n': T['n'][kv], 'dagar': K['dagar']}

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
    return 200, {'id': e, 'typ': dagtyp(nu), 'v': K['v'], 'h': K['h'], 'dagar': K['dagar'], 'auto': e not in inst['av'],
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
