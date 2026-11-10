#!/usr/bin/env python3
# Test av ljusvanorna i kiosk/ljussensor.py mot falsk-ha.py: inlärning, säker/osäker, autopilot och paus.
# Kör: python3 verktyg/ljusvanor-test.py   (startar själv falsk-ha på port 18124 och använder en tillfällig HOME)
import importlib.util, json, os, subprocess, sys, tempfile, time, urllib.request
sys.dont_write_bytecode = True   # ingen __pycache__ i kiosk/
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
    # mörkret: fyra veckor där kvällen blir varm 30 min efter solnedgången (som flyttas från 18 till 16) och läggdags 22.30 efter klockan
    sol = []
    for d in range(-28, 0):
        t0 = kl(d, 12); ned = L.sol_tider(t0)[1]
        sol += [{'t': kl(d, 15), 'e': 'light.sol', 'on': 1, 'k': 3000, 'b': 80, 's': 'm'},
                {'t': round(ned + 1800), 'e': 'light.sol', 'on': 1, 'k': 2000, 'b': 80, 's': 'm'},
                {'t': kl(d, 22, 30), 'e': 'light.sol', 'on': 1, 'k': 2300, 'b': 40, 's': 'm'},
                {'t': kl(d, 23, 30), 'e': 'light.sol', 'on': 0, 'k': None, 'b': None, 's': 'm'}]
    L.VANOR['logg'] = sorted(sol, key=lambda r: r['t']); L.VANOR['kurvor'] = {}
    ned0 = L.sol_tider(kl(0, 12))[1]
    v = L.vanor_nu('light.sol', ned0 + 2700); koll('45 min efter solnedgången: varm, efter mörkret', v['k'] == 2000 and v['saker'] and v['kalla'] == 's', v, time.strftime('%H:%M', time.localtime(ned0 + 2700)))
    v = L.vanor_nu('light.sol', ned0 - 1800); koll('före solnedgången: 3000 K', v['k'] == 3000, v)
    v = L.vanor_nu('light.sol', kl(0, 22, 50)); koll('22.50: läggdags efter klockan', v['k'] == 2300 and v['kalla'] == 'k', v)
    K = L.vanor_kurva('light.sol', kl(0, 21)); koll('soltider följer med till appen', abs(K['sol']['ned'] - 961) < 6, K['sol'])
    # historik från HA: end_time skickas, bara rader äldre än loggen läggs till, inte igen när loggen redan är lång
    anrop = []
    def falsk(c, vag, data=None):
        anrop.append(vag)
        return [[{'entity_id': 'light.hist', 'state': 'on', 'attributes': {'color_mode': 'color_temp', 'color_temp_kelvin': 2400, 'supported_color_modes': ['color_temp'], 'brightness': 128}, 'last_updated': time.strftime('%Y-%m-%dT%H:%M:%S+00:00', time.gmtime(nu - 5 * 86400))},
                  {'entity_id': 'light.hist', 'state': 'off', 'attributes': {}, 'last_updated': time.strftime('%Y-%m-%dT%H:%M:%S+00:00', time.gmtime(nu - 100))}]]
    gammal = L.ha_anrop; L.ha_anrop = falsk
    L.VANOR['logg'] = [{'t': round(nu - 3600), 'e': 'light.hist', 'on': 1, 'k': 2000, 'b': 50, 's': 'm'}]
    L.vanor_historik(cfg, ['light.hist'], nu)
    h = [r for r in L.VANOR['logg'] if r['e'] == 'light.hist']
    koll('historik med end_time', 'end_time=' in anrop[-1] and len(h) == 2 and h[0]['k'] == 2400, anrop[-1], h)
    n0 = len(anrop); L.VANOR['logg'] = [{'t': round(nu - 5 * 86400), 'e': 'light.hist', 'on': 1, 'k': 2000, 'b': 50, 's': 'm'}]
    L.vanor_historik(cfg, ['light.hist'], nu); koll('ingen ny hämtning när loggen är lång', len(anrop) == n0)
    L.ha_anrop = gammal
    # filen skrivs och läses tillbaka
    L.VANOR['logg'] = None; koll('loggen sparas på disk', len(L.vanor_logg()) > 0)
finally:
    fha.terminate()
print('ALLA OK' if not fel else 'FEL: ' + ', '.join(fel)); sys.exit(1 if fel else 0)
