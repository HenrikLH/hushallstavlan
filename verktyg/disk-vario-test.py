#!/usr/bin/env python3
# Test av VarioSpeed på diskmaskinen i kiosk/ljussensor.py mot falsk-ha.py: syns i apparaten, slår på maskinen först
# (Home Connect tar bara emot optioner när den är på), följer med starten och kan inte ändras medan programmet går.
# Kör: python3 verktyg/disk-vario-test.py   (startar själv falsk-ha på port 18126 och använder en tillfällig HOME)
import importlib.util, json, os, subprocess, sys, tempfile, time, urllib.request
sys.dont_write_bytecode = True
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ['HOME'] = tempfile.mkdtemp(); os.makedirs(os.environ['HOME'] + '/.config')
json.dump({'url': 'http://127.0.0.1:18126', 'token': 'test', 'lampor': [], 'scener': [], 'givare': []}, open(os.environ['HOME'] + '/.config/hushallstavlan-ha.json', 'w'))
fha = subprocess.Popen([sys.executable, ROT + '/verktyg/emu/falsk-ha.py', '18126']); time.sleep(.6)
spec = importlib.util.spec_from_file_location('ls', ROT + '/kiosk/ljussensor.py'); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
fel = []
def koll(namn, ok, *info):
    print(('ok   ' if ok else 'FEL  ') + namn, *info); ok or fel.append(namn)
def ha(vag, data=None):
    r = urllib.request.Request('http://127.0.0.1:18126' + vag, method='POST' if data is not None else 'GET', data=json.dumps(data).encode() if data is not None else None, headers={'Authorization': 'Bearer test'})
    return json.loads(urllib.request.urlopen(r).read() or b'null')
st = lambda e: ha('/api/states/' + e)['state']
disk = lambda: next(a for a in L.ha_las(L.ha_cfg())['apparater'] if a['typ'] == 'disk')
try:
    c = L.ha_cfg(); a = disk()
    koll('VarioSpeed finns i apparaten (av när maskinen är av)', 'vario' in a and not a['vario'], a.get('vario'))
    kod, _ = L.ha_app_styr(c, {'app': a['id'], 'vario': True})
    koll('VarioSpeed på: maskinen slås på först, sedan optionen', kod == 200 and st('switch.diskmaskin_av_pa') == 'on' and st('switch.diskmaskin_variospeed') == 'on', kod)
    koll('appen ser VarioSpeed på', disk()['vario'] is True)
    kod, _ = L.ha_app_styr(c, {'app': a['id'], 'vario': False})
    koll('VarioSpeed av', kod == 200 and st('switch.diskmaskin_variospeed') == 'off')
    ha('/api/services/switch/turn_off', {'entity_id': 'switch.diskmaskin_av_pa'}); ha('/api/services/switch/turn_off', {'entity_id': 'switch.diskmaskin_variospeed'})
    kod, _ = L.ha_app_styr(c, {'app': a['id'], 'gor': 'start', 'prog': 'dishcare_dishwasher_program_eco_50', 'vario': True})
    log = ha('/logg'); i = [k for k, x in enumerate(log) if x[2].get('entity_id') == 'switch.diskmaskin_variospeed' and x[1] == 'turn_on']
    j = [k for k, x in enumerate(log) if x[2].get('entity_id') == 'select.diskmaskin_aktivt_program']
    koll('start med VarioSpeed: optionen sätts före programmet', kod == 200 and i and j and i[-1] < j[-1], kod)
    a = disk()
    koll('medan programmet går: VarioSpeed visas som senast valt', a['st'] == 'run' and a['vario'] is True, a['st'], a.get('vario'))
    kod, svar = L.ha_app_styr(c, {'app': a['id'], 'vario': False})
    koll('går inte att ändra medan programmet går', kod == 409, kod, svar)
finally:
    fha.terminate()
print('ALLT OK' if not fel else 'FEL: ' + ', '.join(fel)); sys.exit(1 if fel else 0)
