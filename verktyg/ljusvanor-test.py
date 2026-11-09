#!/usr/bin/env python3
# Test av ljusvanorna i kiosk/ljussensor.py mot falsk-ha.py: inlärning, säker/osäker, autopilot och paus.
# Kör: python3 verktyg/ljusvanor-test.py   (startar själv falsk-ha på port 18124 och använder en tillfällig HOME)
import importlib.util, json, os, subprocess, sys, tempfile, time, urllib.request
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ['HOME'] = tempfile.mkdtemp(); os.environ['TZ'] = 'Europe/Stockholm'; time.tzset()
os.makedirs(os.environ['HOME'] + '/.config')
json.dump({'url': 'http://127.0.0.1:18124', 'token': 'test', 'lampor': ['light.kok', 'light.vardagsrum'], 'scener': [], 'givare': []},
          open(os.environ['HOME'] + '/.config/hushallstavlan-ha.json', 'w'))
fha = subprocess.Popen([sys.executable, ROT + '/verktyg/emu/falsk-ha.py', '18124']); time.sleep(.6)
spec = importlib.util.spec_from_file_location('ls', ROT + '/kiosk/ljussensor.py'); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
fel = []
def koll(namn, ok, *info):
    print(('ok   ' if ok else 'FEL  ') + namn, *info); ok or fel.append(namn)
def ha(vag, data=None):
    r = urllib.request.Request('http://127.0.0.1:18124' + vag, method='POST' if data is not None else 'GET', data=json.dumps(data).encode() if data is not None else None, headers={'Authorization': 'Bearer test'})
    return json.loads(urllib.request.urlopen(r).read() or b'null')
def kl(dag, h, m=0):  # tisdag 2026-11-10 = dag 0
    return time.mktime((2026, 11, 10 + dag, h, m, 0, 0, 0, -1))
try:
    # skalan: samma som lampkortet
    a_k = {'supported_color_modes': ['color_temp', 'xy'], 'min_color_temp_kelvin': 2200, 'max_color_temp_kelvin': 6500}
    koll('kelvin över kmin skickas som color_temp', L.ton_cmd(a_k, 2700) == {'color_temp_kelvin': 2700})
    c = L.ton_cmd(a_k, 1800); koll('varmare än kmin blir hs', 'hs_color' in c, c)
    koll('hs läses tillbaka till samma kelvin', abs(L.ton_k({**a_k, 'color_mode': 'xy', 'hs_color': c['hs_color']}) - 1800) <= 60, L.ton_k({**a_k, 'color_mode': 'xy', 'hs_color': c['hs_color']}))
    koll('riktig färg är ingen ton', L.ton_k({**a_k, 'color_mode': 'hs', 'hs_color': [220, 80]}) is None)
    # 10 dagar: köket tänds 18, 2700 K, varmare (2000 K) kl 20, släcks 23. Två avvikande dagar med 2700 hela kvällen.
    rader = []
    for d in range(-10, 0):
        rader += [{'t': kl(d, 18), 'e': 'light.kok', 'on': 1, 'k': 2700, 'b': 80, 's': 'm'},
                  {'t': kl(d, 20), 'e': 'light.kok', 'on': 1, 'k': 2700 if d in (-10, -6) else 2000, 'b': 80, 's': 'm'},
                  {'t': kl(d, 23), 'e': 'light.kok', 'on': 0, 'k': None, 'b': None, 's': 'm'}]
    L.VANOR['logg'] = rader
    nu = kl(0, 21)
    v = L.vanor_nu('light.kok', nu); koll('lärt sig 2000 K kl 21 på vardagar', v['k'] == 2000 and v['saker'], v)
    v = L.vanor_nu('light.kok', kl(0, 19)); koll('2700 K kl 19', v['k'] == 2700 and v['saker'], v)
    v = L.vanor_nu('light.kok', kl(0, 12)); koll('inget mönster mitt på dagen', v['k'] is None, v)
    v = L.vanor_nu('light.kok', kl(4, 21)); koll('helgen räknas för sig (4 helgdagar, 3 lika = inte säker)', v['n'] == 4 and not v['saker'], v)
    # bara 3 dagar: lär sig men inte säker
    L.VANOR['logg'] = [r for r in rader if r['t'] >= kl(-3, 0)]; L.VANOR['kurvor'] = {}
    v = L.vanor_nu('light.kok', nu); koll('3 dagar: förslag men inte säker', v['k'] == 2000 and not v['saker'], v)
    L.VANOR['logg'] = rader; L.VANOR['kurvor'] = {}
    # autopilot: köket lyser 2700 K kl 21 → glider till 2000 K
    cfg = L.ha_cfg()
    L.VANOR['senast'] = {}; L.VANOR['styrd'] = nu - 120; L.vanor_varv(cfg, nu - 120)     # första varvet: bara läsa av
    L.vanor_varv(cfg, nu)
    s = [x for x in ha('/logg') if x[2].get('entity_id') == 'light.kok']
    koll('styr själv mot 2000 K (köket klarar ned till 2200)', s and s[-1][2].get('color_temp_kelvin') == 2200 and s[-1][2].get('transition') == 60, s[-1:])
    # ingen paus fast lampan ändras av tavlan
    L.vanor_varv(cfg, nu + 5)
    n0 = len(ha('/logg')); L.VANOR['styrd'] = 0; L.vanor_varv(cfg, nu + 150)
    koll('skickar inte igen när lampan nått sin varmaste ton', len(ha('/logg')) == n0)
    koll('egen ändring räknas inte som manuell', not L.vanor_pausad('light.kok', nu + 5) and L.VANOR['logg'][-1]['s'] == 'a', L.VANOR['logg'][-1])
    # någon ändrar själv till 3000 K → paus tills lampan släcks
    ha('/yttre/light.kok?k=3000', {}); L.vanor_varv(cfg, nu + 200)
    p = L.vanor_pausad('light.kok', nu + 200); koll('egen ändring pausar', p and time.localtime(p).tm_hour == 4, p and time.ctime(p))
    n0 = len(ha('/logg')); L.VANOR['styrd'] = 0; L.vanor_varv(cfg, nu + 400)
    koll('ingen styrning under paus', len(ha('/logg')) == n0)
    ha('/yttre/light.kok', {}); L.vanor_varv(cfg, nu + 500)   # släcks
    koll('paus slutar när lampan släcks', not L.vanor_pausad('light.kok', nu + 500))
    ha('/yttre/light.kok', {}); L.vanor_varv(cfg, nu + 600)   # tänds igen med 3000 K → 2 s övergång till vanan
    s = ha('/logg')[-1]; koll('tänds: vanan direkt', s[2].get('entity_id') == 'light.kok' and s[2].get('transition') == 2, s)
    # brytaren av: ingen styrning
    L.vanor_post({'id': 'light.kok', 'auto': False}); ha('/yttre/light.kok?k=3000', {}); L.vanor_varv(cfg, nu + 700)
    n0 = len(ha('/logg')); L.VANOR['styrd'] = 0; L.vanor_varv(cfg, nu + 800)
    koll('automatisk av: rör inte', len(ha('/logg')) == n0 and not L.vanor_pausad('light.kok', nu + 800))
    i = L.vanor_info('light.kok', nu + 800); koll('info till appen', i['auto'] is False and i['k'] == 2000, i)
    L.vanor_post({'pauslage': '1'}); L.vanor_post({'id': 'light.kok', 'auto': True})
    ha('/yttre/light.kok?k=2700', {}); L.vanor_varv(cfg, nu + 900)
    p = L.vanor_pausad('light.kok', nu + 900); koll('pauslage 1 h', p and abs(p - (nu + 900 + 3600)) < 2)
    # filen skrivs och läses tillbaka
    L.VANOR['logg'] = None; koll('loggen sparas på disk', len(L.vanor_logg()) > 0)
finally:
    fha.terminate()
print('ALLA OK' if not fel else 'FEL: ' + ', '.join(fel)); sys.exit(1 if fel else 0)
