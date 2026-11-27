#!/usr/bin/env python3
# Test av tidsinlärningen för dammsugaren i kiosk/ljussensor.py mot falsk-ha.py (Henrik 27/11): tid per rum × läge × gånger (× moppläge)
# lärs bara från omgångar som gick klart; avbrutna omgångar och pausade rum räknas inte. Klockan fejkas, så testet går fort.
# Kör: python3 verktyg/robot-tid-test.py   (startar själv falsk-ha på port 18126 och använder en tillfällig HOME)
import importlib.util, json, os, subprocess, sys, tempfile, time, urllib.request
sys.dont_write_bytecode = True
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ['HOME'] = tempfile.mkdtemp(); os.makedirs(os.environ['HOME'] + '/.config')
json.dump({'url': 'http://127.0.0.1:18126', 'token': 'test', 'lampor': [], 'scener': [], 'givare': []}, open(os.environ['HOME'] + '/.config/hushallstavlan-ha.json', 'w'))
fha = subprocess.Popen([sys.executable, ROT + '/verktyg/emu/falsk-ha.py', '18126']); time.sleep(.6)
spec = importlib.util.spec_from_file_location('ls', ROT + '/kiosk/ljussensor.py'); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
T = [1.8e9]; L.time.time = lambda: T[0]; L.time.sleep = lambda s: None   # fejkad klocka
fel = []
def koll(namn, ok, *info):
    print(('ok   ' if ok else 'FEL  ') + namn, *info); ok or fel.append(namn)
def yttre(v): urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:18126/yttre/' + v, method='POST', data=b'{}'))
def steg(sek, *gor):
    for g in gor: yttre(g)
    T[0] += sek; L.ha_plan()
E = 'vacuum.dammsugare'
tider = lambda: L.ha_cfg().get('tider') or {}
try:
    c = L.ha_cfg()
    L.ha_app_styr(c, {'app': E, 'gor': 'start', 'damm': [16, 17], 'mopp': [17], 'xm': {'17': 2}, 'rm': {'17': 'deep'}})
    p = L.PLAN[E]; koll('planen: dammsugning och moppning', [s['typ'] for s in p['steg']] == ['damm', 'mopp'], p['steg'])
    steg(30, 'rum/16')            # startar, kör in i rum 16
    steg(300)                     # 5 min i rum 16
    steg(5, 'rum/17'); steg(200)  # rum 17
    steg(5, 'hemma')              # hem (falsk-ha har inget "returning": sista rummet slutar när roboten syns i dockan)
    t = tider()
    koll('rum 16 dammsugning ×1 lärd', 300 <= (t.get('16|v|1') or [0])[0] <= 310, t)
    koll('rum 17 dammsugning ×1 lärd', 200 <= (t.get('17|v|1') or [0])[0] <= 210, t)
    koll('resan lärd', 'resa|v' in t, t)
    steg(35); steg(5)             # dockan tömmer, nästa omgång startar
    koll('moppningen har startat', p['i'] == 1 and p['steg'][1].get('x') == 2, p['i'])
    koll('tömningen lärd', 'dock|v' in tider(), tider())
    steg(5, 'rum/17'); steg(600); steg(5, 'hemma')
    t = tider(); koll('rum 17 deep mop ×2 lärd', 600 <= (t.get('17|m|2|deep') or [0])[0] <= 610, t)
    plan = L.ha_robot(L.ha_cfg(), {x['entity_id']: x for x in L.ha_anrop(L.ha_cfg(), '/api/states')}, E)
    koll('appen får tiderna och planens tider', plan.get('tider', {}).get('16|v|1', [0, 0])[1] == 1 and plan['plan'].get('start'), plan.get('tider'))
    # avbruten: stoppas i rum 16 efter 2 min, sedan hem -> inget lärs
    n0 = json.dumps(tider(), sort_keys=True)
    L.ha_app_styr(L.ha_cfg(), {'app': E, 'gor': 'start', 'damm': [16, 17]}); p = L.PLAN[E]
    steg(10, 'rum/16'); steg(120, 'rum/17'); steg(60, 'stopp'); steg(10, 'hemma')
    koll('avbruten omgång', p.get('avbr'), p.get('klar'))
    koll('avbruten omgång lär inget', json.dumps(tider(), sort_keys=True) == n0, tider())
    # pausad i rum 16 och fortsatt: rum 16 räknas inte, rum 17 gör det
    L.ha_app_styr(L.ha_cfg(), {'app': E, 'gor': 'start', 'damm': [16, 17]}); p = L.PLAN[E]
    L.ha_anrop(L.ha_cfg(), '/api/services/vacuum/send_command', {'entity_id': E, 'command': 'app_segment_clean'})
    steg(10, 'rum/16'); steg(100); steg(60, 'stopp'); L.ha_anrop(L.ha_cfg(), '/api/services/vacuum/send_command', {'entity_id': E, 'command': 'app_segment_clean'}); steg(100)
    steg(5, 'rum/17'); steg(250); steg(5, 'hemma')
    t = tider()
    koll('pausat rum lärs inte', len(t['16|v|1']) == 1, t['16|v|1'])
    koll('rummet efter pausen lärs', len(t['17|v|1']) == 2 and 250 <= t['17|v|1'][1] <= 260, t['17|v|1'])
finally:
    fha.terminate()
print('ALLT OK' if not fel else 'FEL: ' + ', '.join(fel)); sys.exit(1 if fel else 0)
