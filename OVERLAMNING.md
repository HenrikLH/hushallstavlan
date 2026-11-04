# Aktuell överlämning — 2026-11-04

Claude och Codex: läs AGENTS.md och denna fil (rutinerna finns som skills i `.claude/skills/`). Detaljer om publicerat arbete finns i git-loggen och PR:erna; denna fil har bara aktuell status.

## Börja här

- Aktuell release: **ht-v254** (PR #65, mindre lagg i hundbilden). Ångra-gren `version-fore-lagg-hundbild`.
- Inga pågående uppgifter utöver punkterna nedan. Gör inte om godkända ändringar.
- Strömningen i ChatGPT har avbrutits flera gånger: kontrollera gren/PR/main och Pages innan en avbruten publicering återupptas.

## Pågår nu

- Inget. Senast publicerat: rutiner som skills (PR #66, bara dokumentation, ångra-gren `version-fore-skills`).

## Följ upp med Henrik

- Hundbilden (ht-v249–v254): känns animationerna mjuka på iPhone? Huvudvickningen minskades till ≈2° (`.geo-huvud`/`GEO_NACKE`); ta bort eller ändra om han fortfarande ogillar den. Undvik nya rörliga delar i de stilla SVG:erna (`svg.fig-lag`/`svg.bd-lag` är de rörliga) och nya SVG-filter i Geometrisk.
- Inköpssynk mellan telefoner (ht-v252, test `verktyg/emu/inkop-synk.js`): följ upp om fler synkfel syns.
- GPU-lager (`gpuLager`, bara gemensam skärm tills iPhone prövats; `ht.gpu=1/0` tvingar): rör sig Surfacen mjukt?
- Grå väggskärm: kiosken kör Chromium med GPU + vakthund i `kiosk/ljussensor.py`. Följ upp med `journalctl --user -u ljussensor | grep vakt` på Surfacen. Datorn kör XFCE, inte Cinnamon.

## Kräver verklig hårdvara

- UI 3.0 med iPhone-tangentbord och på Surface.
- Adaptiv ljusstyrka på Surface (ht-v163–v169).

## Väntar på Henrik (Kod.gs)

- Inget. Henrik bekräftade 2026-10-21 att Kod.gs/setupRecipes/distribution är uppdaterade. Namn/rum på sysslor kan inte ändras utan ny Kod.gs (`cleanSet` tillåter bara freq/min/who/plannedFor/snoozeUntil).

## Beslut som ska bevaras (inte självklara i koden)

- UI 2.0 är standard och ska bevaras; Ateljé är frivilligt UI 4.0, UI 3.0 finns kvar i utvecklarläget.
- Veckosedel: ingen automatisk Ätit-status eller datumspärr; låst borttagning kräver håll in.
- Håll in = lyft (`hlOn/hlOff`); `data-hold`-bekräftelseknappar behåller fyllningen med flit.
- Väderhimlen: vita stjärnor i mörkt läge (gula i ljust), inga stjärnor vid dimma, molnform B+C (Henrik avvisade bubblig och trappstegsformad underkant), molnmängd efter `cloud_area_fraction`.
- Trädet i Geometrisk: tydliga cirklar och starka färger.
- Timerpillret: ingen tid i staplarna (Henriks val).
- Födelsedagar: egna tillägg/färger i `onskelista` (`{fod:1,add,del}`, `col`) läggs ovanpå kalendersynken.
- `installningar.js` faller även på main (gammalt fel, inte orsakat av senare ändringar).
