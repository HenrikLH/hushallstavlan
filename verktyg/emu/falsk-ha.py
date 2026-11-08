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
        self.svar(404, {})
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0); d = json.loads(self.rfile.read(n) or b'{}')
        if self.path.startswith('/yttre/'):   # testet: någon tänder med strömbrytaren
            e = self.path[7:]; S[e][0] = 'on' if S[e][0] == 'off' else 'off'; return self.svar(200, {})
        if not self.ok(): return
        _, _, _, dom, tj = self.path.split('/'); e = d['entity_id']; LOG.append([dom, tj, d])
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
