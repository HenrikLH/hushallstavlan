#!/usr/bin/env python3
# Test av solljuset och automationerna i kiosk/ljussensor.py mot falsk-ha.py: standardlampa, inställning, toning (tjänsten
# själv och via HA-skriptet), schemat kring sol upp/ned, avbrott vid handpåläggning, vanorna står åt sidan, automation av/på.
# Kör: python3 verktyg/solljus-test.py   (startar själv falsk-ha på port 18125 och använder en tillfällig HOME)
import importlib.util, json, os, subprocess, sys, tempfile, time, urllib.request
sys.dont_write_bytecode = True
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ['HOME'] = tempfile.mkdtemp(); os.environ['TZ'] = 'Europe/Stockholm'; time.tzset()
os.makedirs(os.environ['HOME'] + '/.config')
json.dump({'url': 'http://127.0.0.1:18125', 'token': 'test', 'lampor': ['light.kok', 'light.vagglampa'], 'scener': [], 'givare': []},
          open(os.environ['HOME'] + '/.config/hushallstavlan-ha.json', 'w'))
fha = subprocess.Popen([sys.executable, ROT + '/verktyg/emu/falsk-ha.py', '18125']); time.sleep(.6)
spec = importlib.util.spec_from_file_location('ls', ROT + '/kiosk/ljussensor.py'); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
fel = []
def koll(namn, ok, *info):
    print(('ok   ' if ok else 'FEL  ') + namn, *info); ok or fel.append(namn)
def ha(vag, data=None):
    r = urllib.request.Request('http://127.0.0.1:18125' + vag, method='POST' if data is not None else 'GET', data=json.dumps(data).encode() if data is not None else None, headers={'Authorization': 'Bearer test'})
    return json.loads(urllib.request.urlopen(r).read() or b'null')
st = lambda e: next(x for x in ha('/api/states') if x['entity_id'] == e)
def vanta(villkor, s=6):
    t = time.time() + s
    while time.time() < t and not villkor(): time.sleep(.05)
    return villkor()
try:
    L.SOL_STEG = 0.05
    c = L.ha_cfg()
    koll('vägglampan är standard', L.sol_std_lampa(c) == 'light.vagglampa')
    d = L.ha_las(c)
    S = {x['id']: x for x in d['sol']}
    koll('två solljus, av från början', set(S) == {'upp', 'ned'} and not S['upp']['pa'] and not S['ned']['pa'], d['sol'])
    koll('förval +60 och −60 min', S['upp']['off'] == 60 and S['ned']['off'] == -60 and S['upp']['min'] == 60)
    upp, ned, _ = L.sol_tider(time.time())
    koll('soltider i dag och i morgon', S['upp']['sol'][0] == round(upp) and S['upp']['sol'][1] > S['upp']['sol'][0] + 80000 and S['ned']['sol'][0] == round(ned))
    koll('automationerna syns', [a['n'] for a in d['auto']] == ['Morgonljus i hallen', 'Robot städar tisdagar'] and d['auto'][0]['on'] and not d['auto'][1]['on'], d['auto'])
    # inställning
    kod, _ = L.ha_val({'sol': 'upp', 'pa': True, 'off': 75, 'min': 4})
    S = {x['id']: x for x in L.ha_las(L.ha_cfg())['sol']}
    koll('sparar på, +1 tim 15 min, minst 5 min', kod == 200 and S['upp']['pa'] and S['upp']['off'] == 75 and S['upp']['min'] == 5, S['upp'])
    koll('gränser: off ±180, minst 5 min', L.ha_val({'sol': 'ned', 'off': -999, 'min': 1})[0] == 200 and L.sol_inst(L.ha_cfg())['ned']['off'] == -180 and L.sol_inst(L.ha_cfg())['ned']['min'] == 5)
    koll('okänd lampa nekas', L.ha_val({'sol': 'ned', 'lampa': 'light.hall'})[0] == 403)
    koll('fel riktning nekas', L.ha_val({'sol': 'mitt', 'pa': True})[0] == 400)
    # soluppgång, tjänsten tonar själv (inget script.solljus): släckt lampa → varm och svag → kall och full
    L.ha_val({'sol': 'upp', 'min': 5})
    kod, _ = L.ha_styr({'sol': 'upp', 'gor': 'nu'})
    koll('startar nu', kod == 200 and L.sol_tonas('light.vagglampa', time.time()))
    koll('första steget: varmt och 1 %', vanta(lambda: st('light.vagglampa')['state'] == 'on', 2) and st('light.vagglampa')['attributes']['color_temp_kelvin'] <= 2300, st('light.vagglampa')['attributes'])
    koll('klar: kall och full', vanta(lambda: L.SOL_KOR['light.vagglampa']['stopp'].is_set()) and st('light.vagglampa')['attributes']['color_temp_kelvin'] == 4000 and st('light.vagglampa')['attributes']['brightness'] == 255, st('light.vagglampa')['attributes'])
    nu = time.time()
    koll('vanorna pausas efteråt', not L.sol_tonas('light.vagglampa', nu) and L.vanor_pausad('light.vagglampa', nu))
    # solnedgång från full: slutar varm på 35 %
    L.ha_val({'sol': 'ned', 'min': 5, 'slut': 35})
    L.ha_styr({'sol': 'ned', 'gor': 'nu'})
    koll('solnedgång: varm och 35 %', vanta(lambda: L.SOL_KOR['light.vagglampa']['stopp'].is_set()) and st('light.vagglampa')['attributes']['color_temp_kelvin'] == 2202 and round(st('light.vagglampa')['attributes']['brightness'] / 2.55) == 35, st('light.vagglampa')['attributes'])
    # handpåläggning: någon släcker → toningen slutar och tänder inte igen
    L.SOL_STEG = 0.4
    L.ha_val({'sol': 'upp', 'min': 30})
    L.ha_styr({'sol': 'upp', 'gor': 'nu'}); time.sleep(.6)
    ha('/yttre/light.vagglampa', {})   # strömbrytaren
    koll('släckt för hand: slutar', vanta(lambda: L.SOL_KOR['light.vagglampa']['stopp'].is_set(), 3) and st('light.vagglampa')['state'] == 'off')
    time.sleep(.5); koll('tänds inte igen', st('light.vagglampa')['state'] == 'off')
    # stoppa
    L.ha_styr({'sol': 'upp', 'gor': 'nu'}); time.sleep(.2)
    L.ha_styr({'sol': 'upp', 'gor': 'stopp'})
    koll('Stoppa avbryter', L.SOL_KOR['light.vagglampa']['stopp'].is_set())
    # med HA-skriptet: tjänsten startar skriptet med variablerna
    L.SOL_SKRIPT = 'scene.kvall'   # finns i falska HA; skriptanropet loggas bara
    n0 = len(ha('/logg'))
    L.ha_styr({'sol': 'ned', 'gor': 'nu'})
    sk = [x for x in ha('/logg')[n0:] if x[0] == 'script' and x[1] == 'turn_on']
    koll('HA-skriptet startas med variabler', sk and sk[0][2]['variables'] == {'riktning': 'ned', 'lampa': 'light.vagglampa', 'minuter': 5, 'slut': 35}, sk)
    koll('vanorna rör inte lampan medan skriptet tonar', L.sol_tonas('light.vagglampa', time.time()) and L.sol_tonas('light.vagglampa', time.time() + 5 * 60))
    L.ha_styr({'sol': 'ned', 'gor': 'stopp'})
    sk = [x for x in ha('/logg')[n0:] if x[0] == 'script' and x[1] == 'turn_off']
    koll('Stoppa stänger av skriptet', bool(sk))
    L.SOL_SKRIPT = 'script.solljus'
    # schemat: start = sol upp + 75 min, körs en gång, inte när den är av
    c = L.ha_cfg(); x = L.sol_inst(c)['upp']; s0 = L.sol_start('upp', x, time.time())
    koll('starttid = soluppgång + 75 min', abs(s0 - (L.sol_tider(time.time())[0] + 75 * 60)) < 1)
    L.SOL_KOR.clear(); L.SOL_GJORD.clear()
    L.sol_varv(c, s0 - 30); koll('inte före', 'light.vagglampa' not in L.SOL_KOR)
    L.sol_varv(c, s0 + 10); koll('startar vid tiden', 'light.vagglampa' in L.SOL_KOR)
    L.SOL_KOR['light.vagglampa']['stopp'].set(); L.SOL_KOR.clear()
    L.sol_varv(c, s0 + 40); koll('bara en gång', 'light.vagglampa' not in L.SOL_KOR)
    L.ha_val({'sol': 'upp', 'pa': False}); L.SOL_GJORD.clear()
    L.sol_varv(L.ha_cfg(), s0 + 10); koll('avstängd startar inte', 'light.vagglampa' not in L.SOL_KOR)
    L.ha_val({'sol': 'ned', 'pa': True, 'off': 180}); c = L.ha_cfg(); x = L.sol_inst(c)['ned']
    t1 = L.sol_start('ned', x, time.time() - 86400) + 86400 * 0
    L.SOL_GJORD.clear(); L.SOL_KOR.clear()
    # efter midnatt: gårdagens solnedgång + 3 h kan hamna efter 00 på sommaren; räknas från gårdagens datum
    s1 = L.sol_start('ned', x, time.time() - 86400)
    L.sol_varv(c, s1 + 5); koll('gårdagens solnedgång räknas', 'light.vagglampa' in L.SOL_KOR)
    for k in L.SOL_KOR.values(): k['stopp'].set()
    # automation av/på
    kod, _ = L.ha_styr({'automation': 'automation.robot_tisdag', 'pa': True})
    koll('automation slås på', kod == 200 and st('automation.robot_tisdag')['state'] == 'on')
    L.ha_styr({'automation': 'automation.robot_tisdag', 'pa': False})
    koll('automation slås av', st('automation.robot_tisdag')['state'] == 'off')
    koll('annat än automation nekas', L.ha_styr({'automation': 'light.kok', 'pa': False})[0] == 403 and L.ha_styr({'automation': 'automation.finns_inte', 'pa': False})[0] == 403)
finally:
    fha.kill()
print('\n' + ('ALLA OK' if not fel else 'FEL: ' + ', '.join(fel)))
sys.exit(1 if fel else 0)
