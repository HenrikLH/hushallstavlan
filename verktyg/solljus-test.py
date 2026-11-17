#!/usr/bin/env python3
# Test av solljuset och automationerna i kiosk/ljussensor.py mot falsk-ha.py (som har HA-paketet solljus-paket.yaml):
# förval första gången, inställningar till HA:s input_number/input_text, av/på = automationen, Starta nu/Stoppa,
# vanorna står åt sidan medan skriptet tonar, Home Assistants övriga automationer av/på.
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
alla = lambda: {x['entity_id']: x for x in ha('/api/states')}
sol = lambda: {x['id']: x for x in L.ha_las(L.ha_cfg())['sol']}
try:
    c = L.ha_cfg()
    koll('vägglampan är förval', L.sol_std_lampa(c) == 'light.vagglampa')
    S = sol()
    koll('nyinstallerat: förvalen visas', S['upp']['off'] == 60 and S['ned']['off'] == -60 and S['upp']['min'] == 60 and S['ned']['slut'] == 35 and S['upp']['lampa'] == 'light.vagglampa', S)
    koll('förvalen skrivs till HA', st('input_number.solljus_upp_off')['state'] == '60.0' and st('input_number.solljus_ned_off')['state'] == '-60.0'
         and st('input_number.solljus_ned_slut')['state'] == '35.0' and st('input_text.solljus_ned_lampa')['state'] == 'light.vagglampa')
    S = sol()
    upp, ned, _ = L.sol_tider(time.time())
    koll('på = automationen, soltider i dag och i morgon', S['upp']['pa'] and S['upp']['sol'][0] == round(upp) and S['ned']['sol'][0] == round(ned) and S['upp']['sol'][1] > S['upp']['sol'][0] + 80000)
    d = L.ha_las(L.ha_cfg())
    koll('övriga automationer listas, solljusets inte', [a['n'] for a in d['auto']] == ['Morgonljus i hallen', 'Robot städar tisdagar'], d['auto'])
    # inställning → HA
    kod, _ = L.ha_val({'sol': 'upp', 'off': 75, 'min': 45})
    koll('+1 tim 15 min och 45 min sparas i HA', kod == 200 and st('input_number.solljus_upp_off')['state'] == '75.0' and st('input_number.solljus_upp_min')['state'] == '45.0' and sol()['upp']['off'] == 75)
    L.ha_val({'sol': 'ned', 'off': -999, 'min': 7, 'slut': 33})
    koll('gränser och steg', st('input_number.solljus_ned_off')['state'] == '-180.0' and st('input_number.solljus_ned_min')['state'] == '15.0' and st('input_number.solljus_ned_slut')['state'] == '35.0')
    koll('soluppgången har inget kvällsljus', L.ha_val({'sol': 'upp', 'slut': 20})[0] == 200 and sol()['upp']['slut'] == 100)
    koll('lampa sparas', L.ha_val({'sol': 'ned', 'lampa': 'light.kok'})[0] == 200 and st('input_text.solljus_ned_lampa')['state'] == 'light.kok')
    koll('okänd lampa nekas', L.ha_val({'sol': 'ned', 'lampa': 'light.hall'})[0] == 403)
    koll('fel riktning nekas', L.ha_val({'sol': 'mitt', 'pa': True})[0] == 400)
    L.ha_val({'sol': 'ned', 'pa': False})
    koll('brytaren slår av automationen', st('automation.solljus_solnedgang')['state'] == 'off' and not sol()['ned']['pa'])
    L.ha_val({'sol': 'ned', 'pa': True}); koll('och på igen', st('automation.solljus_solnedgang')['state'] == 'on')
    # Starta nu
    n0 = len(ha('/logg'))
    kod, _ = L.ha_styr({'sol': 'ned', 'gor': 'nu'})
    sk = [x for x in ha('/logg')[n0:] if x[0] == 'script' and x[1] == 'turn_on']
    koll('Starta nu kör skriptet med HA:s värden', kod == 200 and sk and sk[0][2]['variables'] == {'riktning': 'ned', 'lampa': 'light.kok', 'minuter': 15, 'slut': 35}, sk)
    S = sol(); koll('raden visar att den tonar', S['ned']['kor'] and not S['upp']['kor'], S['ned']['kor'])
    # vanorna
    A = alla(); nu = time.time()
    koll('vanorna rör inte lampan medan skriptet går', L.sol_tonas(c, A, 'light.kok', nu) and not L.sol_tonas(c, A, 'light.sovrum', nu))
    L.ha_styr({'sol': 'ned', 'gor': 'stopp'})
    koll('Stoppa stänger av skriptet', st('script.solljus')['state'] == 'off' and not sol()['ned']['kor'])
    koll('vanorna pausas efteråt', not L.sol_tonas(c, alla(), 'light.kok', nu) and L.vanor_pausad('light.kok', nu))
    # övriga automationer
    kod, _ = L.ha_styr({'automation': 'automation.robot_tisdag', 'pa': True})
    koll('automation slås på', kod == 200 and st('automation.robot_tisdag')['state'] == 'on')
    L.ha_styr({'automation': 'automation.robot_tisdag', 'pa': False})
    koll('automation slås av', st('automation.robot_tisdag')['state'] == 'off')
    koll('annat än automation nekas', L.ha_styr({'automation': 'light.kok', 'pa': False})[0] == 403 and L.ha_styr({'automation': 'automation.finns_inte', 'pa': False})[0] == 403)
    # utan paketet: inget solljus
    L.SOL_SKRIPT = 'script.saknas'; koll('utan paketet visas inget solljus', L.ha_las(L.ha_cfg())['sol'] == [])
finally:
    fha.kill()
print('\n' + ('ALLA OK' if not fel else 'FEL: ' + ', '.join(fel)))
sys.exit(1 if fel else 0)
