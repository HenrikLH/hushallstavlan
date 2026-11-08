#!/usr/bin/env python3
# Ljustjänst för Hushållstavlan på väggdatorn.
#   GET  /lux          -> {"lux": 9.4}
#   GET  /ljusstyrka   -> {"procent": 10.0, "mal": 10.0, "normal": 60.0, "styrs": false}
#   POST /ljusstyrka   {"procent": 35}   tonar skärmens riktiga ljusstyrka dit på ~1 s
#   POST /ljusstyrka   {"normal": true}  tillbaka till normal ljusstyrka
#   POST /puls                           tavlan har just ritat en bild (skickas var 20:e sekund)
#   GET  /ha?v=N       -> lampor, scener och givare från Home Assistant; väntar upp till 25 s på en ändring om N är aktuell
#   POST /ha           {"id": "light.kok", "gor": "vaxla"|"pa"|"av", "b": 1-100, "k": kelvin, "hs": [nyans, mättnad]} | {"scen": "scene.kvall"} | {"alla": "av"}
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
        l = {'id': e, 'n': namn(e, x), 't': e.split('.')[0], 'on': pa, 'nas': x.get('state') == 'unavailable',
             'b': round((a.get('brightness') or 0) / 2.55) if pa and a.get('brightness') else None}
        if l['t'] == 'light':
            # vad lampan klarar: dimmer, färgtemperatur (kelvin) och/eller färg (nyans/mättnad)
            l.update({'lagen': a.get('supported_color_modes') or [], 'lage': a.get('color_mode'), 'k': a.get('color_temp_kelvin'),
                      'kmin': a.get('min_color_temp_kelvin'), 'kmax': a.get('max_color_temp_kelvin'), 'hs': a.get('hs_color')})
        lampor.append(l)
    for e in c['scener']:
        if e in alla: scener.append({'id': e, 'n': namn(e, alla[e])})
    for e in c['givare']:
        x = alla.get(e)
        if x: givare.append({'id': e, 'n': namn(e, x), 'v': x.get('state'), 'u': (x.get('attributes') or {}).get('unit_of_measurement')})
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
        if self.path.split('?')[0] == '/ha':
            if self.headers.get('Origin') not in TILLATNA:
                return self.svara(403, {'fel': 'bara tavlan får styra hemmet'})
            try:
                n = int(self.headers.get('Content-Length') or 0)
                kod, svar = ha_styr(json.loads(self.rfile.read(min(n, 1000)) or b'{}'))
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
