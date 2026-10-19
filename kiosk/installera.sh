#!/usr/bin/env bash
# Gör en Linux Mint-dator (Cinnamon) till en väggtavla för Hushållstavlan:
#  - loggar in automatiskt utan lösenord
#  - startar tavlan i helskärm (kioskläge) direkt efter inloggning
#  - stänger av skärmsläckare, skärmlås och viloläge
#  - startar Claude-appen i bakgrunden bakom tavlan, om den är installerad
#  - gör kameran tillgänglig för tavlan (rummets ljus), om datorns kamera går att nå
# Kör som den vanliga användaren (inte med sudo); skriptet frågar efter lösenordet när det behövs.
# Ångra med:  bash installera.sh --ta-bort
set -euo pipefail

URL="https://henriklh.github.io/hushallstavlan/"
ANV="${USER:-$(id -un)}"
AUTOSTART="$HOME/.config/autostart/hushallstavlan.desktop"
CLAUDE_AUTOSTART="$HOME/.config/autostart/claude-bakom-tavlan.desktop"
MENY="$HOME/.local/share/applications/hushallstavlan.desktop"
SKRIVBORD="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")/hushallstavlan.desktop"
LIGHTDM="/etc/lightdm/lightdm.conf.d/90-hushallstavlan.conf"

if [ "$(id -u)" -eq 0 ]; then
  echo "Kör skriptet som din vanliga användare, utan sudo." >&2; exit 1
fi

if [ "${1:-}" = "--ta-bort" ]; then
  rm -f "$AUTOSTART" "$CLAUDE_AUTOSTART" "$MENY" "$SKRIVBORD"
  sudo rm -f "$LIGHTDM"
  gsettings set org.cinnamon.desktop.screensaver lock-enabled true || true
  gsettings set org.cinnamon.desktop.session idle-delay 600 || true
  gsettings set org.nemo.preferences click-policy double 2>/dev/null || true
  echo "Klart. Kioskläge och automatisk inloggning är avstängda efter nästa omstart."
  exit 0
fi

echo "1/6  Chromium"
if command -v chromium >/dev/null 2>&1; then BROWSER=chromium
elif command -v chromium-browser >/dev/null 2>&1; then BROWSER=chromium-browser
elif command -v google-chrome >/dev/null 2>&1; then BROWSER=google-chrome
else
  sudo apt-get update
  sudo apt-get install -y chromium
  BROWSER=chromium
fi
echo "     använder $BROWSER"

echo "2/6  Automatisk inloggning för $ANV"
sudo mkdir -p /etc/lightdm/lightdm.conf.d
printf '[Seat:*]\nautologin-user=%s\nautologin-user-timeout=0\n' "$ANV" | sudo tee "$LIGHTDM" >/dev/null

echo "3/6  Skärmen hålls tänd och olåst"
gsettings set org.cinnamon.desktop.screensaver lock-enabled false || true
gsettings set org.cinnamon.desktop.screensaver idle-activation-enabled false 2>/dev/null || true
gsettings set org.cinnamon.desktop.session idle-delay 0 || true
for k in sleep-display-ac sleep-display-battery sleep-inactive-ac-timeout sleep-inactive-battery-timeout; do
  gsettings set org.cinnamon.settings-daemon.plugins.power "$k" 0 2>/dev/null || true
done
gsettings set org.cinnamon.settings-daemon.plugins.power lock-on-suspend false 2>/dev/null || true

echo "4/6  Claude-appen startar i bakgrunden"
mkdir -p "$(dirname "$AUTOSTART")"
# Hitta Claude-appens startfil bland de installerade programmen och starta den direkt vid inloggning.
# Tavlan väntar längre än Claude, så att helskärmsfönstret hamnar överst.
CLAUDE_EXEC=""
for d in "$HOME/.local/share/applications" /usr/share/applications /usr/local/share/applications /var/lib/flatpak/exports/share/applications "$HOME/.local/share/flatpak/exports/share/applications" /var/lib/snapd/desktop/applications; do
  [ -d "$d" ] || continue
  for f in "$d"/*.desktop; do
    [ -f "$f" ] || continue
    case "${f##*/}" in hushallstavlan*) continue;; esac
    if grep -qiE '^Name=Claude( Desktop)?$' "$f"; then
      CLAUDE_EXEC="$(grep -m1 '^Exec=' "$f" | cut -d= -f2- | sed 's/ *%[fFuUick]//g')"
      break 2
    fi
  done
done
VANTA=4
if [ -n "$CLAUDE_EXEC" ]; then
  cat > "$CLAUDE_AUTOSTART" <<EOF
[Desktop Entry]
Type=Application
Name=Claude bakom tavlan
Comment=Startar Claude-appen i bakgrunden
Exec=$CLAUDE_EXEC
X-GNOME-Autostart-enabled=true
EOF
  VANTA=12
  echo "     startar: $CLAUDE_EXEC"
else
  rm -f "$CLAUDE_AUTOSTART"
  echo "     hittade ingen Claude-app bland programmen, hoppar över (kör skriptet igen när den är installerad)"
fi

echo "5/6  Kameran (för rummets ljus)"
# Surface-datorernas kameror är inte vanliga webbkameror: de nås bara via libcamera, och Chromium når libcamera via PipeWire.
# Steget installerar det som behövs om det finns i paketkällorna och slår bara på PipeWire-kameran i Chromium om libcamera hittar en kamera.
KAMERA_FLAGG=""
KPKT=""
for p in libcamera-tools libspa-0.2-libcamera pipewire-libcamera; do
  if apt-cache show "$p" >/dev/null 2>&1; then KPKT="$KPKT $p"; fi
done
if [ -n "$KPKT" ]; then sudo apt-get install -y $KPKT >/dev/null 2>&1 || echo "     kunde inte installera:$KPKT"; fi
if ls /dev/video* >/dev/null 2>&1 && command -v v4l2-ctl >/dev/null 2>&1 && v4l2-ctl --list-devices 2>/dev/null | grep -qiE 'webcam|uvc|camera'; then
  echo "     hittade en vanlig webbkamera, den fungerar direkt"
elif command -v cam >/dev/null 2>&1 && cam -l 2>/dev/null | grep -qE '^[0-9]+:'; then
  KAMERA_FLAGG=" --enable-features=WebRtcPipeWireCamera"
  echo "     libcamera hittar kameran:"; cam -l 2>/dev/null | grep -E '^[0-9]+:' | sed 's/^/       /'
  if ! systemctl --user is-active --quiet pipewire 2>/dev/null; then
    echo "     OBS: PipeWire körs inte, så Chromium når ändå inte kameran. Installera pipewire och wireplumber och starta om."
  fi
else
  echo "     hittade ingen kamera som Linux kan använda. Rummets ljus fungerar inte på den här datorn."
fi

echo "6/6  Tavlan startar i helskärm vid inloggning"
# --password-store=basic: ingen fråga om nyckelring när inloggningen sker utan lösenord
# --touch-events=enabled: pekskärmen skickar riktiga pekhändelser
# --overscroll-history-navigation=0: ett svep i sidled bläddrar inte bakåt i webbläsaren
cat > "$AUTOSTART" <<EOF
[Desktop Entry]
Type=Application
Name=Hushållstavlan
Comment=Startar tavlan i helskärm
Exec=sh -c 'sleep $VANTA; $BROWSER --kiosk --app=$URL --password-store=basic --touch-events=enabled --overscroll-history-navigation=0 --noerrdialogs --disable-session-crashed-bubble --disable-infobars --check-for-update-interval=31536000$KAMERA_FLAGG'
X-GNOME-Autostart-enabled=true
EOF
# Samma start som ikon i menyn och på skrivbordet, så att tavlan kan öppnas igen med fingret
mkdir -p "$(dirname "$MENY")" "$(dirname "$SKRIVBORD")"
grep -v '^X-GNOME' "$AUTOSTART" | sed "s/sleep $VANTA; //" > "$MENY"
cp "$MENY" "$SKRIVBORD"; chmod +x "$MENY" "$SKRIVBORD"
gio set "$SKRIVBORD" metadata::trusted true 2>/dev/null || true
# Ett tryck räcker för att öppna ikoner på skrivbordet (dubbeltryck fungerar dåligt med pekskärm)
gsettings set org.nemo.preferences click-policy single 2>/dev/null || true

echo
echo "Klart! Starta om datorn så loggar den in och öppnar tavlan av sig själv."
echo "Lämna helskärmen: håll fingret på klockan i översikten i tre sekunder (eller Alt+F4)."
echo "Öppna tavlan igen med ett tryck på ikonen Hushållstavlan på skrivbordet, eller via menyn."
