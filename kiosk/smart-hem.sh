#!/bin/bash
# Kopplar väggskärmens Smart hem-ruta till Home Assistant på den här datorn. Kör som vanlig användare (inte sudo):
#   bash kiosk/smart-hem.sh
# Frågar efter en långlivad token (skapa den i HA som användaren "Tavlan", inte administratör: Profil → Säkerhet),
# sparar den bara i ~/.config/hushallstavlan-ha.json (läsbar bara för dig) och väljer alla lampor och scener i HA
# plus en temperaturgivare. Ta bort eller lägg till rader i filen efteråt; tjänsten läser om den av sig själv.
set -e
cd "$(dirname "$0")"
FIL="$HOME/.config/hushallstavlan-ha.json"
read -rp "Adress till Home Assistant [http://127.0.0.1:8123]: " URL; URL="${URL:-http://127.0.0.1:8123}"
read -rsp "Klistra in token (syns inte): " TOKEN; echo
mkdir -p "$HOME/.config" "$HOME/.local/bin" "$HOME/.config/systemd/user"
umask 077
HA_URL="$URL" HA_TOKEN="$TOKEN" FIL="$FIL" python3 -I - <<'PY'
import json, os, urllib.request
u, t, fil = os.environ['HA_URL'].rstrip('/'), os.environ['HA_TOKEN'], os.environ['FIL']
r = urllib.request.Request(u + '/api/states', headers={'Authorization': 'Bearer ' + t})
try:
    alla = json.load(urllib.request.urlopen(r, timeout=10))
except Exception as e:
    raise SystemExit('Kunde inte läsa från Home Assistant (%s). Stämmer adressen och token?' % e)
dom = lambda x: x['entity_id'].split('.')[0]
namn = lambda x: (x.get('attributes') or {}).get('friendly_name') or x['entity_id']
lampor = sorted([x for x in alla if dom(x) == 'light'], key=namn)
scener = sorted([x for x in alla if dom(x) == 'scene'], key=namn)
temp = [x for x in alla if dom(x) == 'sensor' and (x.get('attributes') or {}).get('device_class') == 'temperature']
brytare = [x for x in alla if dom(x) == 'switch']
cfg = {'url': u, 'token': t, 'lampor': [x['entity_id'] for x in lampor], 'scener': [x['entity_id'] for x in scener],
       'givare': [x['entity_id'] for x in temp[:1]]}
json.dump(cfg, open(fil, 'w'), ensure_ascii=False, indent=1)
os.chmod(fil, 0o600)
print('\nSparat i', fil)
for rub, lst in (('Lampor', lampor), ('Scener', scener), ('Temperatur', temp[:1])):
    print(rub + ':', ', '.join(namn(x) for x in lst) or '(inga)')
if brytare:
    print('\nUttag och brytare som INTE är med (lägg till under "lampor" om du vill):')
    for x in brytare: print('  ', x['entity_id'], '-', namn(x))
PY
cp ljussensor.py "$HOME/.local/bin/ljussensor.py"
[ -f "$HOME/.config/systemd/user/ljussensor.service" ] || cp ljussensor.service "$HOME/.config/systemd/user/"
systemctl --user daemon-reload
systemctl --user enable ljussensor >/dev/null 2>&1 || true
systemctl --user restart ljussensor
echo
echo "Klart. Smart hem-rutan dyker upp på väggskärmen inom fem minuter (eller direkt om tavlan laddas om)."
