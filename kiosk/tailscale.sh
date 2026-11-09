#!/bin/bash
# Gör Smart hem nåbart från era telefoner via Tailscale (privat nät, bara era inloggade enheter, inget öppet mot internet).
# Kör som vanlig användare på väggdatorn (Docker, inget sudo):  bash kiosk/tailscale.sh
# Bara /ha i den lokala tjänsten (kiosk/ljussensor.py) delas ut, som https://<namn>.<tailnet>.ts.net/ha.
# Första gången skrivs en inloggningslänk ut: öppna den i telefonen och godkänn väggdatorn i ditt Tailscale-konto.
# Tailscale kräver att HTTPS-certifikat är påslaget (admin-konsolen → DNS → HTTPS Certificates); serve skriver ut en länk om inte.
# Ångra: docker rm -f tailscale && rm -rf ~/tailscale
set -e
mkdir -p "$HOME/tailscale"
if ! docker ps -a --format '{{.Names}}' | grep -qx tailscale; then
  # Bara tailscaled, inte containerns startskript: det startar om efter 60 s utan inloggning och gör då en ny länk.
  docker run -d --name tailscale --restart unless-stopped --network host \
    -v "$HOME/tailscale:/var/lib/tailscale" --entrypoint tailscaled tailscale/tailscale:stable \
    --tun=userspace-networking --statedir=/var/lib/tailscale
  sleep 5
fi
docker exec tailscale tailscale up --hostname=hushallstavlan --accept-dns=false
docker exec tailscale tailscale serve --bg --set-path /ha http://127.0.0.1:8777/ha
NAMN=$(docker exec tailscale tailscale status --json | python3 -c "import json,sys;print(json.load(sys.stdin)['Self']['DNSName'].rstrip('.'))")
echo
echo "Klart. Skriv in den här adressen i Hushållstavlan på telefonen (Inställningar → Enheten → Väggdatorns adress):"
echo "  https://$NAMN"
