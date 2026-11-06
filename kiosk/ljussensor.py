#!/usr/bin/env python3
# Ljustjänst för Hushållstavlan på väggdatorn.
#   GET  /lux          -> {"lux": 9.4}
#   GET  /ljusstyrka   -> {"procent": 10.0, "mal": 10.0, "normal": 60.0, "styrs": false}
#   POST /ljusstyrka   {"procent": 35}   tonar skärmens riktiga ljusstyrka dit på ~1 s
#   POST /ljusstyrka   {"normal": true}  tillbaka till normal ljusstyrka
#   POST /puls                           tavlan har just ritat en bild (skickas var 20:e sekund)
# Vakthund: Chromium på väggdatorn kan fastna med en grå/svart sida (renderaren väntar på GPU-processen, som har tappat
# sitt delade minne) utan att krascha. Har tavlan skickat puls någon gång men tystnat i VAKT_TYST sekunder medan
# kioskfönstret finns kvar, startas tavlan om med samma kommando som vid inloggning. Stänger man tavlan finns ingen
# process kvar och vakten gör ingenting. Avstängd tills den första pulsen kommit (äldre appversioner skickar ingen).
# Säkerhet: bara tavlans egen sida får ändra ljusstyrkan, aldrig under MIN_PROCENT, och hör tavlan
# inte av sig på LEASE sekunder går skärmen tillbaka till normal ljusstyrka (så den aldrig fastnar mörk).
# Installera: kopiera till ~/.local/bin/ljussensor.py och ljussensor.service till ~/.config/systemd/user/,
# kör sedan: systemctl --user daemon-reload && systemctl --user enable --now ljussensor
import glob, json, os, re, signal, subprocess, threading, time, http.server

TILLATNA = {'https://henriklh.github.io'}
MIN_PROCENT = 1.0
LEASE = 120
TONING = 1.0
BL = (glob.glob('/sys/class/backlight/*') or [None])[0]
NORMAL_FIL = os.path.expanduser('~/.config/hushallstavlan-ljus.json')
VAKT_FIL = os.path.expanduser('~/.config/hushallstavlan-vakt.json')
AUTOSTART = os.path.expanduser('~/.config/autostart/hushallstavlan.desktop')
VAKT_TYST = 60

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
        self.huvuden(kod); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)
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
http.server.ThreadingHTTPServer(('127.0.0.1', 8777), H).serve_forever()
