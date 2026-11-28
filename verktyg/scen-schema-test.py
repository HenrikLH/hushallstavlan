#!/usr/bin/env python3
# Test av scenernas tidslinje i kiosk/ljussensor.py mot falsk-ha.py: tona (transition), senare steg med högtalare/scen,
# nedräkning i /ha, "nasta" kör nästa steg direkt, och schemat (tid, villkor, alla går hemifrån / någon kommer hem).
# Kör: python3 verktyg/scen-schema-test.py   (startar själv falsk-ha på port 18127 och använder en tillfällig HOME)
import importlib.util, json, os, subprocess, sys, tempfile, time, urllib.request
sys.dont_write_bytecode = True
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ['HOME'] = tempfile.mkdtemp(); os.makedirs(os.environ['HOME'] + '/.config')
json.dump({'url': 'http://127.0.0.1:18127', 'token': 'test', 'lampor': ['light.kok', 'light.hall', 'light.sovrum'], 'scener': ['scene.kvall'], 'givare': []}, open(os.environ['HOME'] + '/.config/hushallstavlan-ha.json', 'w'))
fha = subprocess.Popen([sys.executable, ROT + '/verktyg/emu/falsk-ha.py', '18127']); time.sleep(.6)
spec = importlib.util.spec_from_file_location('ls', ROT + '/kiosk/ljussensor.py'); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
fel = []
def koll(namn, ok, *info):
    print(('ok   ' if ok else 'FEL  ') + namn, *info); ok or fel.append(namn)
def ha(vag, data=None):
    r = urllib.request.Request('http://127.0.0.1:18127' + vag, method='POST' if data is not None else 'GET', data=json.dumps(data).encode() if data is not None else None, headers={'Authorization': 'Bearer test'})
    return json.loads(urllib.request.urlopen(r).read() or b'null')
logg = lambda: ha('/logg')
st = lambda e: ha('/api/states/' + e)['state']
try:
    c = L.ha_cfg()
    kod, _ = L.ha_styr({'id': 'light.kok', 'gor': 'pa', 'b': 40, 'k': 2200, 't': 30})
    x = [y for y in logg() if y[0] == 'light'][-1]
    koll('tona: transition skickas till lampan', kod == 200 and x[1] == 'turn_on' and x[2].get('transition') == 30 and x[2].get('color_temp_kelvin') == 2200, x)
    L.ha_styr({'id': 'light.kok', 'gor': 'av', 't': 10})
    y = [y for y in logg() if y[0] == 'light'][-1]
    koll('tona ner: transition även när den släcks', y[1] == 'turn_off' and y[2].get('transition') == 10, y)
    L.ha_senare({'nyckel': 'scen', 'n': 'Läggdags', 'senare': [{'om': 60, 'txt': 'Släcker Hallen', 'steg': [{'id': 'light.hall', 'gor': 'av', 't': 5}]},
                                                             {'om': 120, 'txt': 'Spela radio', 'steg': [{'media': ['media_player.stor'], 'gor': 'stopp'}, {'scen': 'scene.kvall'}]}]})
    i = L.ha_las(c)['senare']
    koll('väntande steg syns i /ha med namn, tid och text', len(i) == 2 and i[0]['n'] == 'Läggdags' and i[0]['txt'] == 'Släcker Hallen' and i[0]['t'] > time.time() + 50, i)
    ha('/yttre/light.hall', {}); n0 = len(logg())
    L.ha_senare({'nyckel': 'scen', 'senare': 'nasta'})
    ny = logg()[n0:]
    koll('"nasta" kör första steget direkt', any(x[0] == 'light' and x[1] == 'turn_off' and x[2]['entity_id'] == 'light.hall' and x[2].get('transition') == 5 for x in ny) and len(L.senare_info()) == 1, ny)
    n0 = len(logg()); L.ha_senare({'nyckel': 'scen', 'senare': 'nasta'}); ny = logg()[n0:]
    koll('högtalare och HA-scen i ett senare steg', any(x[0] == 'media_player' and x[1] == 'media_stop' for x in ny) and any(x[0] == 'scene' for x in ny) and not L.senare_info(), ny)
    L.ha_senare({'nyckel': 'scen', 'n': 'X', 'senare': [{'om': 5, 'steg': [{'id': 'light.sovrum', 'gor': 'pa'}]}]}); L.ha_senare({'nyckel': 'scen', 'senare': []})
    koll('tom lista avbryter', not L.senare_info())
    L.ha_senare({'nyckel': 'scen', 'n': 'Snabb', 'senare': [{'om': 1, 'steg': [{'id': 'light.sovrum', 'gor': 'pa'}]}]}); time.sleep(1.6)
    koll('timern kör steget och tar bort det ur listan', st('light.sovrum') == 'on' and not L.senare_info(), st('light.sovrum'))
    # schema: på en tid (nu), körs en gång per dag
    nu = time.time(); hm = time.strftime('%H:%M', time.localtime(nu))
    L.schema_satt({'schema': [{'id': 'sc0', 'n': 'Kväll', 'nar': 'tid', 'hm': hm, 'dag': list(range(7)), 'nu': [{'id': 'light.kok', 'gor': 'pa', 'b': 70}], 'senare': [{'om': 600, 'txt': 'Släcker Köket', 'steg': [{'id': 'light.kok', 'gor': 'av'}]}]}]})
    koll('schemat sparas och syns i /ha', L.ha_las(c)['schema'] == 1 and os.path.exists(L.SCHEMA_FIL))
    ha('/api/services/light/turn_off', {'entity_id': 'light.kok'})
    L.schema_kolla(c, nu + 5)
    koll('på en tid: scenen startar och nästa steg väntar', st('light.kok') == 'on' and len(L.senare_info()) == 1 and L.senare_info()[0]['n'] == 'Kväll', st('light.kok'), L.senare_info())
    ha('/api/services/light/turn_off', {'entity_id': 'light.kok'}); L.schema_kolla(c, nu + 30)
    koll('körs bara en gång per dag', st('light.kok') == 'off')
    L.ha_senare({'nyckel': 'scen', 'senare': []})
    # fel dag och för sent
    L.SCHEMA['kord'] = {}; dag = time.localtime(nu).tm_wday
    L.schema_satt({'schema': [{'id': 'sc1', 'n': 'A', 'nar': 'tid', 'hm': hm, 'dag': [(dag + 1) % 7], 'nu': [{'id': 'light.kok', 'gor': 'pa'}]}]}); L.schema_kolla(c, nu + 5)
    koll('annan veckodag: körs inte', st('light.kok') == 'off')
    L.schema_satt({'schema': [{'id': 'sc2', 'n': 'B', 'nar': 'tid', 'hm': hm, 'dag': [], 'nu': [{'id': 'light.kok', 'gor': 'pa'}]}]}); L.schema_kolla(c, nu + 900)
    koll('mer än 10 min efter klockslaget (omstart): körs inte i efterhand', st('light.kok') == 'off')
    # villkor mörkt
    upp, ned = L.sol_tider(nu)[:2]; mork = not (upp <= nu + 5 < ned)
    L.SCHEMA['kord'] = {}; L.schema_satt({'schema': [{'id': 'sc3', 'n': 'C', 'nar': 'tid', 'hm': hm, 'mork': 1, 'nu': [{'id': 'light.kok', 'gor': 'pa'}]}]}); L.schema_kolla(c, nu + 5)
    koll('villkoret "bara när det är mörkt" följer solen', (st('light.kok') == 'on') == mork, 'mörkt' if mork else 'ljust')
    ha('/api/services/light/turn_off', {'entity_id': 'light.kok'})
    # alla går hemifrån / någon kommer hem
    L.schema_satt({'schema': [{'id': 'b', 'n': 'Borta', 'nar': 'borta', 'nu': [{'id': 'light.hall', 'gor': 'av'}]}, {'id': 'h', 'n': 'Hemma', 'nar': 'hemma', 'nu': [{'id': 'light.kok', 'gor': 'pa'}]}]})
    ha('/api/services/light/turn_on', {'entity_id': 'light.hall'}); L.SCHEMA['hemma'] = None
    L.schema_kolla(c, nu); ha('/yttre/person/person.henrik?s=not_home', {}); L.schema_kolla(c, nu)
    koll('en går: inget händer så länge någon är hemma', st('light.hall') == 'on')
    ha('/yttre/person/person.cornelia?s=not_home', {}); L.schema_kolla(c, nu)
    koll('sista går hemifrån: Borta körs', st('light.hall') == 'off' and st('light.kok') == 'off')
    ha('/yttre/person/person.henrik?s=home', {}); L.schema_kolla(c, nu)
    koll('någon kommer hem: Hemma körs', st('light.kok') == 'on')
    L2 = importlib.util.module_from_spec(spec); spec.loader.exec_module(L2); L2.schema_las()
    koll('schemat läses in igen efter omstart', len(L2.SCHEMA['l']) == 2)
finally:
    fha.terminate()
print('ALLT OK' if not fel else 'FEL: ' + ', '.join(fel)); sys.exit(1 if fel else 0)
