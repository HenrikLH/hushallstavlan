#!/usr/bin/env python3
# Låtsas-Home Assistant för test av kiosk/ljussensor.py: GET /api/states och POST /api/services/<domän>/<tjänst>.
# Kör: python3 verktyg/emu/falsk-ha.py 18123   (token "test")
import json, sys, http.server, threading
S = {
 'light.kok': ['on', {'friendly_name': 'Köket', 'brightness': 204, 'supported_color_modes': ['color_temp'], 'color_mode': 'color_temp', 'color_temp_kelvin': 2700, 'min_color_temp_kelvin': 2200, 'max_color_temp_kelvin': 4000}],
 'light.vardagsrum': ['on', {'friendly_name': 'Vardagsrum', 'brightness': 115, 'supported_color_modes': ['color_temp', 'xy'], 'color_mode': 'xy', 'hs_color': [28, 70], 'min_color_temp_kelvin': 2200, 'max_color_temp_kelvin': 6500}],
 'switch.fonster': ['on', {'friendly_name': 'Fönster'}],
 'light.hall': ['off', {'friendly_name': 'Hallen'}],
 'light.sovrum': ['off', {'friendly_name': 'Sovrum'}],
 'light.bad': ['unavailable', {'friendly_name': 'Badrum'}],
 'lock.ytterdorr': ['locked', {'friendly_name': 'Ytterdörren'}],
 'scene.kvall': ['scening', {'friendly_name': 'Kväll'}],
 'scene.film': ['scening', {'friendly_name': 'Film'}],
 'sensor.inne': ['21.4', {'friendly_name': 'Inne', 'unit_of_measurement': '°C', 'device_class': 'temperature'}],
 'light.tak_kok': ['off', {'friendly_name': 'Taklampa kök', 'supported_color_modes': ['brightness'], 'color_mode': 'brightness'}],
 'fan.golvflakt': ['off', {'friendly_name': 'Golvfläkt'}],
 'switch.diskmaskin_barnlas': ['off', {'friendly_name': 'Diskmaskin Barnlås'}],
 'sensor.ute': ['6.1', {'friendly_name': 'Ute', 'unit_of_measurement': '°C', 'device_class': 'temperature'}],
 'sensor.batteri': ['80', {'friendly_name': 'Batteri', 'unit_of_measurement': '%', 'device_class': 'battery'}],
}
# Robotdammsugare (Roborock + RoborockCustomMap) och diskmaskin (Home Connect), entiteter som hos Henrik (svenska namn)
ROB = 'Dammsugare '
S.update({
 'vacuum.dammsugare': ['docked', {'friendly_name': 'Dammsugare', 'fan_speed': 'balanced', 'fan_speed_list': ['quiet', 'balanced', 'turbo', 'max', 'max_plus', 'off', 'custom']}],
 'sensor.dammsugare_status': ['charging', {'friendly_name': ROB + 'Status', 'device_class': 'enum', 'options': ['idle', 'cleaning', 'returning_home', 'charging', 'paused', 'segment_cleaning', 'error', 'charging_complete']}],
 'sensor.dammsugare_batteri': ['100', {'friendly_name': ROB + 'Batteri', 'unit_of_measurement': '%', 'device_class': 'battery'}],
 'sensor.dammsugare_stadning_status': ['0', {'friendly_name': ROB + 'Städning status', 'unit_of_measurement': '%'}],
 'sensor.dammsugare_stadad_area': ['13.3', {'friendly_name': ROB + 'Städad area', 'unit_of_measurement': 'm²'}],
 'sensor.dammsugare_totalt_stadad_area': ['24550.1', {'friendly_name': ROB + 'Totalt städad area', 'unit_of_measurement': 'm²'}],
 'sensor.dammsugare_stadtid': ['12.13', {'friendly_name': ROB + 'Städtid', 'unit_of_measurement': 'min', 'device_class': 'duration'}],
 'sensor.dammsugare_total_stadtid': ['496.0', {'friendly_name': ROB + 'Total städtid', 'unit_of_measurement': 'h', 'device_class': 'duration'}],
 'sensor.dammsugare_huvudborste_tid_kvar': ['47.85', {'friendly_name': ROB + 'Huvudborste tid kvar', 'unit_of_measurement': 'h', 'device_class': 'duration'}],
 'sensor.dammsugare_sidoborste_tid_kvar': ['-90.74', {'friendly_name': ROB + 'Sidoborste tid kvar', 'unit_of_measurement': 'h', 'device_class': 'duration'}],
 'sensor.dammsugare_filtertid_kvar': ['53.95', {'friendly_name': ROB + 'Filtertid kvar', 'unit_of_measurement': 'h', 'device_class': 'duration'}],
 'sensor.dammsugare_sensortid_kvar': ['-142.56', {'friendly_name': ROB + 'Sensortid kvar', 'unit_of_measurement': 'h', 'device_class': 'duration'}],
 'sensor.dammsugare_nuvarande_rum': ['unknown', {'friendly_name': ROB + 'Nuvarande rum', 'device_class': 'enum'}],
 'sensor.dammsugare_fel_pa_dammsugaren': ['none', {'friendly_name': ROB + 'Fel på dammsugaren', 'device_class': 'enum', 'options': ['none', 'lidar_blocked', 'bumper_stuck']}],
 'sensor.dammsugare_starttid_for_senaste_stadningen': ['2026-11-08T17:20:28+00:00', {'friendly_name': ROB + 'Starttid för senaste städningen', 'device_class': 'timestamp'}],
 'sensor.dammsugare_sluttid_for_senaste_stadningen': ['2026-11-08T17:32:37+00:00', {'friendly_name': ROB + 'Sluttid för senaste städningen', 'device_class': 'timestamp'}],
 'select.dammsugare_rengoringslage': ['vac_and_mop', {'friendly_name': ROB + 'Rengöringsläge', 'options': ['vacuum', 'vac_and_mop', 'mop', 'custom']}],
 'select.dammsugare_moppintensitet': ['medium', {'friendly_name': ROB + 'Moppintensitet', 'options': ['off', 'low', 'medium', 'high', 'custom_water_flow', 'custom']}],
 'select.dammsugare_mopplage': ['standard', {'friendly_name': ROB + 'Moppläge', 'options': ['standard', 'deep', 'deep_plus', 'fast', 'custom']}],
 'button.dammsugare_k': ['unknown', {'friendly_name': ROB + 'K'}],
 'button.dammsugare_allt_v_m': ['unknown', {'friendly_name': ROB + 'Allt - V + M'}],
 'image.roborock_qrevo_storgatsbacken_4b_custom': ['2026-11-09T20:16:52+00:00', {'friendly_name': 'Roborock Qrevo Storgatsbacken 4B_custom',
   'calibration_points': [{'vacuum': {'x': 25500, 'y': 25500}, 'map': {'x': 1036.0, 'y': 480.0}}, {'vacuum': {'x': 35500, 'y': 25500}, 'map': {'x': 1836.0, 'y': 480.0}}, {'vacuum': {'x': 25500, 'y': 35500}, 'map': {'x': 1036.0, 'y': -320.0}}],
   'rooms': {'16': {'x0': 17100, 'y0': 17700, 'x1': 18450, 'y1': 19800, 'number': 16, 'name': 'Unknown'}, '17': {'x0': 18050, 'y0': 20050, 'x1': 21650, 'y1': 24450, 'number': 17, 'name': 'Unknown'},
             '18': {'x0': 20600, 'y0': 20200, 'x1': 26400, 'y1': 28050, 'number': 18, 'name': 'Unknown'}, '19': {'x0': 22050, 'y0': 16550, 'x1': 26400, 'y1': 20150, 'number': 19, 'name': 'Unknown'},
             '20': {'x0': 26450, 'y0': 18200, 'x1': 28200, 'y1': 20250, 'number': 20, 'name': 'Unknown'}, '21': {'x0': 18500, 'y0': 17700, 'x1': 22050, 'y1': 19800, 'number': 21, 'name': 'Unknown'}}}],
 'select.diskmaskin_valt_program': ['dishcare_dishwasher_program_eco_50', {'friendly_name': 'Diskmaskin Valt program', 'options': ['dishcare_dishwasher_program_intensiv_70', 'dishcare_dishwasher_program_auto_2', 'dishcare_dishwasher_program_eco_50', 'dishcare_dishwasher_program_pre_rinse', 'dishcare_dishwasher_program_night_wash', 'dishcare_dishwasher_program_quick_65', 'dishcare_dishwasher_program_machine_care']}],
 'select.diskmaskin_aktivt_program': ['unknown', {'friendly_name': 'Diskmaskin Aktivt program', 'options': ['dishcare_dishwasher_program_intensiv_70', 'dishcare_dishwasher_program_auto_2', 'dishcare_dishwasher_program_eco_50', 'dishcare_dishwasher_program_pre_rinse', 'dishcare_dishwasher_program_night_wash', 'dishcare_dishwasher_program_quick_65', 'dishcare_dishwasher_program_machine_care']}],
 'sensor.diskmaskin_driftstatus': ['ready', {'friendly_name': 'Diskmaskin Driftstatus', 'device_class': 'enum', 'options': ['inactive', 'ready', 'delayedstart', 'run', 'pause', 'actionrequired', 'finished', 'error', 'aborting']}],
 'sensor.diskmaskin_dorr': ['closed', {'friendly_name': 'Diskmaskin Dörr', 'device_class': 'enum', 'options': ['closed', 'locked', 'open']}],
 'sensor.diskmaskin_programmets_framsteg': ['unavailable', {'friendly_name': 'Diskmaskin Programmets framsteg', 'unit_of_measurement': '%'}],
 'sensor.diskmaskin_programmets_sluttid': ['unavailable', {'friendly_name': 'Diskmaskin Programmets sluttid', 'device_class': 'timestamp'}],
 'sensor.diskmaskin_saltet_ar_nastan_tomt': ['off', {'friendly_name': 'Diskmaskin Saltet är nästan tomt', 'device_class': 'enum', 'options': ['confirmed', 'off', 'present']}],
 'sensor.diskmaskin_skoljmedlet_nastan_tomt': ['present', {'friendly_name': 'Diskmaskin Sköljmedlet nästan tomt', 'device_class': 'enum', 'options': ['confirmed', 'off', 'present']}],
 'binary_sensor.diskmaskin_fjarrstart': ['on', {'friendly_name': 'Diskmaskin Fjärrstart'}],
 'button.diskmaskin_stoppa_program': ['unknown', {'friendly_name': 'Diskmaskin Stoppa program'}],
})
def karta_png():
    # enkel låtsaskarta 1648x1500 med rummen som färgade rektanglar (riktig bild: FALSK_KARTA=fil.png)
    import os, zlib, struct
    if os.environ.get('FALSK_KARTA'): return open(os.environ['FALSK_KARTA'], 'rb').read()
    W, H = 1648, 1500; f = lambda x, y: (1036 + (x - 25500) * .08, 480 - (y - 25500) * .08)
    fg = [(136, 195, 232), (239, 176, 121), (217, 137, 128), (205, 96, 85), (51, 151, 218), (164, 105, 187)]
    R = []
    for i, q in enumerate(S['image.roborock_qrevo_storgatsbacken_4b_custom'][1]['rooms'].values()):
        (a, b), (c, d) = f(q['x0'], q['y0']), f(q['x1'], q['y1']); R.append((int(min(a, c)), int(min(b, d)), int(max(a, c)), int(max(b, d)), fg[i]))
    rad = []
    for y in range(H):
        r = bytearray(b'\x00' + b'\x00\x00\x00\x00' * W)
        for x0, y0, x1, y1, c in R:
            if y0 <= y < y1:
                for x in range(x0, x1): r[1 + 4 * x:5 + 4 * x] = bytes(c) + b'\xff'
        rad.append(bytes(r))
    ch = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 6, 0, 0, 0)) + ch(b'IDAT', zlib.compress(b''.join(rad))) + ch(b'IEND', b'')
SCEN = {'scene.kvall': {'light.vardagsrum': 115, 'switch.fonster': 1, 'light.kok': 77}, 'scene.film': {'light.vardagsrum': 26}}
LOG = []
class H(http.server.BaseHTTPRequestHandler):
    def svar(self, kod, d):
        b = json.dumps(d).encode(); self.send_response(kod); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(b)
    def ok(self):
        if self.headers.get('Authorization') != 'Bearer test': self.svar(401, {'message': 'Unauthorized'}); return False
        return True
    def do_GET(self):
        if not self.ok(): return
        if self.path == '/api/states': return self.svar(200, [{'entity_id': k, 'state': v[0], 'attributes': v[1]} for k, v in S.items()])
        if self.path == '/logg': return self.svar(200, LOG)
        if self.path.startswith('/api/image_proxy/'):
            b = karta_png(); self.send_response(200); self.send_header('Content-Type', 'image/png'); self.end_headers(); self.wfile.write(b); return
        self.svar(404, {})
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0); d = json.loads(self.rfile.read(n) or b'{}')
        if self.path.startswith('/yttre/'):   # testet: någon tänder med strömbrytaren
            e = self.path[7:]; S[e][0] = 'on' if S[e][0] == 'off' else 'off'; return self.svar(200, {})
        if not self.ok(): return
        _, _, _, dom, tj = self.path.split('/'); e = d['entity_id']; LOG.append([dom, tj, d])
        if dom == 'vacuum':
            S[e][0] = {'start': 'cleaning', 'send_command': 'cleaning', 'pause': 'paused', 'return_to_base': 'returning'}.get(tj, S[e][0])
            S['sensor.dammsugare_status'][0] = {'cleaning': 'segment_cleaning' if tj == 'send_command' else 'cleaning', 'paused': 'paused', 'returning': 'returning_home'}.get(S[e][0], 'charging')
            if tj == 'set_fan_speed': S[e][1]['fan_speed'] = d['fan_speed']
            return self.svar(200, [])
        if dom == 'select':
            S[e][0] = d['option']
            if e == 'select.diskmaskin_aktivt_program': S['sensor.diskmaskin_driftstatus'][0] = 'run'; S['sensor.diskmaskin_programmets_framsteg'][0] = '12'; S['sensor.diskmaskin_programmets_sluttid'][0] = '2026-11-09T22:40:00+00:00'
            return self.svar(200, [])
        if dom == 'button':
            if e == 'button.diskmaskin_stoppa_program': S['sensor.diskmaskin_driftstatus'][0] = 'ready'; S['select.diskmaskin_aktivt_program'][0] = 'unknown'
            return self.svar(200, [])
        if S[e][0] == 'unavailable': return self.svar(200, [])
        if tj == 'toggle': S[e][0] = 'off' if S[e][0] == 'on' else 'on'
        elif tj == 'turn_off': S[e][0] = 'off'
        elif tj == 'turn_on' and dom == 'scene':
            for k in S:
                if k.split('.')[0] in ('light', 'switch') and S[k][0] != 'unavailable': S[k][0] = 'off'
            for k, b in SCEN[e].items():
                S[k][0] = 'on'
                if k.startswith('light'): S[k][1]['brightness'] = b
        elif tj == 'turn_on':
            S[e][0] = 'on'
            if 'brightness_pct' in d: S[e][1]['brightness'] = round(d['brightness_pct'] * 2.55)
            if 'color_temp_kelvin' in d: S[e][1].update(color_temp_kelvin=d['color_temp_kelvin'], color_mode='color_temp')
            if 'hs_color' in d: S[e][1].update(hs_color=d['hs_color'], color_mode='hs')
        self.svar(200, [])
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 18123), H).serve_forever()
