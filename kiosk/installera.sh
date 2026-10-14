#!/usr/bin/env bash
# Gör en Linux Mint-dator (Cinnamon) till en väggtavla för Hushållstavlan:
#  - loggar in automatiskt utan lösenord
#  - startar tavlan i helskärm (kioskläge) direkt efter inloggning
#  - stänger av skärmsläckare, skärmlås och viloläge
# Kör som den vanliga användaren (inte med sudo); skriptet frågar efter lösenordet när det behövs.
# Ångra med:  bash installera.sh --ta-bort
set -euo pipefail

URL="https://henriklh.github.io/hushallstavlan/"
ANV="${USER:-$(id -un)}"
AUTOSTART="$HOME/.config/autostart/hushallstavlan.desktop"
LIGHTDM="/etc/lightdm/lightdm.conf.d/90-hushallstavlan.conf"

if [ "$(id -u)" -eq 0 ]; then
  echo "Kör skriptet som din vanliga användare, utan sudo." >&2; exit 1
fi

if [ "${1:-}" = "--ta-bort" ]; then
  rm -f "$AUTOSTART"
  sudo rm -f "$LIGHTDM"
  gsettings set org.cinnamon.desktop.screensaver lock-enabled true || true
  gsettings set org.cinnamon.desktop.session idle-delay 600 || true
  echo "Klart. Kioskläge och automatisk inloggning är avstängda efter nästa omstart."
  exit 0
fi

echo "1/4  Chromium"
if command -v chromium >/dev/null 2>&1; then BROWSER=chromium
elif command -v chromium-browser >/dev/null 2>&1; then BROWSER=chromium-browser
elif command -v google-chrome >/dev/null 2>&1; then BROWSER=google-chrome
else
  sudo apt-get update
  sudo apt-get install -y chromium
  BROWSER=chromium
fi
echo "     använder $BROWSER"

echo "2/4  Automatisk inloggning för $ANV"
sudo mkdir -p /etc/lightdm/lightdm.conf.d
printf '[Seat:*]\nautologin-user=%s\nautologin-user-timeout=0\n' "$ANV" | sudo tee "$LIGHTDM" >/dev/null

echo "3/4  Skärmen hålls tänd och olåst"
gsettings set org.cinnamon.desktop.screensaver lock-enabled false || true
gsettings set org.cinnamon.desktop.screensaver idle-activation-enabled false 2>/dev/null || true
gsettings set org.cinnamon.desktop.session idle-delay 0 || true
for k in sleep-display-ac sleep-display-battery sleep-inactive-ac-timeout sleep-inactive-battery-timeout; do
  gsettings set org.cinnamon.settings-daemon.plugins.power "$k" 0 2>/dev/null || true
done
gsettings set org.cinnamon.settings-daemon.plugins.power lock-on-suspend false 2>/dev/null || true

echo "4/4  Tavlan startar i helskärm vid inloggning"
mkdir -p "$(dirname "$AUTOSTART")"
# --password-store=basic: ingen fråga om nyckelring när inloggningen sker utan lösenord
# --touch-events=enabled: pekskärmen skickar riktiga pekhändelser
# --overscroll-history-navigation=0: ett svep i sidled bläddrar inte bakåt i webbläsaren
cat > "$AUTOSTART" <<EOF
[Desktop Entry]
Type=Application
Name=Hushållstavlan
Comment=Startar tavlan i helskärm
Exec=sh -c 'sleep 4; $BROWSER --kiosk --app=$URL --password-store=basic --touch-events=enabled --overscroll-history-navigation=0 --noerrdialogs --disable-session-crashed-bubble --disable-infobars --check-for-update-interval=31536000'
X-GNOME-Autostart-enabled=true
EOF

echo
echo "Klart! Starta om datorn så loggar den in och öppnar tavlan av sig själv."
echo "Lämna helskärmen med Alt+F4. Öppna terminalen med Ctrl+Alt+T."
