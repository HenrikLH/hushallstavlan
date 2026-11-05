# Aktuell överlämning — 2026-11-04

Claude och Codex: läs AGENTS.md och denna fil (rutinerna finns som skills i `.claude/skills/`). Detaljer om publicerat arbete finns i git-loggen och PR:erna; denna fil har bara aktuell status.

## Börja här

- Aktuell release: **ht-v256** (Städvyn: Rutnät och Ring). Ångra-gren `version-fore-stadvy`.
- Inga pågående uppgifter utöver punkterna nedan. Gör inte om godkända ändringar.
- Strömningen i ChatGPT har avbrutits flera gånger: kontrollera gren/PR/main och Pages innan en avbruten publicering återupptas.

## Pågår nu

- **UI 5.0 (Apple)** (Claude, gren `claude/project-thread-petrxp`, utkast-PR): Henrik valde alla rekommendationer: eget val UI 5.0 (`ht.ui=5`, `U5`, CSS bara under `html.ny.ui5` sist i `<style>`), vinröd behålls, rubriker ovanför korten. Plan i 5 steg i Claude Doc "Apple-känsla: genomgång och plan". Steg 1 (grund: färger, glasmeny tvingad via `nav-glas`, kort, listor, segment, knappar, blad, inställningar med symboler) byggd, väntar på Henriks ok/Pusha. Test: `verktyg/emu/ui5.js`, alla-flikar med `LS={"ui":"5"}` telefon/vägg/mörkt. Nästa: steg 2 navigering (glid in från höger, svep tillbaka, blad med halv höjd, iOS-brytare, svep på rader, dra ned för att uppdatera).
- Inget. Senast publicerat: Städvyn kan väljas som Lista (standard), Rutnät eller Ring under Inställningar → Mat och städ (`ht.stadVy`, `stadRutnat`/`stadRing` i app.js, CSS `.sx-*`). Test: `NOW=<idag> node verktyg/emu/run.js verktyg/emu/stad-vyer.js` (emulerade servern sätter lastDone med riktigt datum).

## Följ upp med Henrik

- Städvyn (ht-v256): vilken av Rutnät/Ring vill han ha kvar? Förslag C (lugn lista) byggdes inte. Rutnätets rutor bockas av med tryck, håll in ger bladet.

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
