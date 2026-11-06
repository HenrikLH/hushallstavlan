# Aktuell överlämning — 2026-11-04

Claude och Codex: läs AGENTS.md och denna fil (rutinerna finns som skills i `.claude/skills/`). Detaljer om publicerat arbete finns i git-loggen och PR:erna; denna fil har bara aktuell status.

## Börja här

- Aktuell release: **ht-v266**: plusknappen syns på Kalender-fliken (`addContext`), och emu-scenarierna går till Städ via Att göra (`#nav uppgifter` + `taskTab stad`). Ångra-gren `version-fore-kalender-plus`. Gröna: alla-flikar telefon+vägg, plus-alternativ, ui-versioner (`LS={"ui":"2"}`), stad-vyer, stad-plus, hall-in-blad.
- Förra: **ht-v265**: jämn luft (≈12 px) runt draghandtagen i väder (Översikt), Schema och matbudget (`.ovx`/`.ovcal`/`.wcard>.motion-grip` i index.html). Ångra-gren `version-fore-handtag-luft` (= ht-v264). Röktest telefon+vägg grönt.
- Förra: **ht-v264**: UI 5.0 (Apple) är standard. ht-v263: kalendern har egen flik; Uppgifter och Städ delar Att göra (`attSeg`, `S.taskTab` = lista|stad), ångra-gren `version-fore-kalenderflik`.
- ht-v261: inga dubbletter av uppgifter/varor när svaret från arket tappas (`redanSparad`/`osaker`/`n0` i flush/apiPost, `rid` till Kod.gs; test `verktyg/emu/uppgift-dubblett.js`, även `NOCACHE=1`). Ångra-gren `version-fore-dubbletter`.
- Inga pågående uppgifter utöver punkterna nedan. Gör inte om godkända ändringar.
- Strömningen i ChatGPT har avbrutits flera gånger: kontrollera gren/PR/main och Pages innan en avbruten publicering återupptas.

## Pågår nu

- Inget pågående. Senast publicerat (ht-v261): borttagen öppen uppgift ger Ångra i 5 s och hamnar i "Nyligen borttagna" (ruta U12) under Klara i 30 dagar, synkat mellan enheter via `onskelista` `{bort:1,l:[{k,title,due,who,repeat,at,by}]}` (ingen Kod.gs; `wishes()`/`recipeWishes` hoppar över den). Återställ = `taskAdd`. Klara uppgifter sparas inte. Test `verktyg/emu/uppgift-aterstall.js`.

- Inget pågående. **UI 5.0 (Apple) är standard** sedan ht-v264 (Henriks beslut 2026-11-06; ångra-gren `version-fore-ui5-standard`). `U5` = `ht.ui` saknas eller `5`; UI 2.0 sparas som `ht.ui=2`. CI: matris UI 2 kör med `{ui:"2"}`, UI 5 utan `ui`. Kända fel från ht-v263 (kalenderfliken): `ui-versioner.js` och `plus-alternativ.js` klickar på `taskTab` lista som inte längre finns där; behöver anpassas.
- Inget. Senast publicerat: Städvyn kan väljas som Lista (standard), Rutnät eller Ring under Inställningar → Mat och städ (`ht.stadVy`, `stadRutnat`/`stadRing` i app.js, CSS `.sx-*`). Test: `NOW=<idag> node verktyg/emu/run.js verktyg/emu/stad-vyer.js` (emulerade servern sätter lastDone med riktigt datum).

## Följ upp med Henrik

- Kalenderflik (ht-v263): hittar ni kalendern nu, och saknas Städ som egen flik? Gamla `ht.taskTab=kalender` öppnar Kalender-fliken vid start.
- Svepgester i UI 5.0 (ht-v258, PR #69): känns svep tillbaka rätt i iPhone? Justera i så fall `u5Fart.proj` (r=0,997), gränsen W/2 eller fjäderns 0,42 s. Test `LS='{"ui":"5"}' node verktyg/emu/run.js verktyg/emu/ui5-gester.js`.

- Städvyn (ht-v256): vilken av Rutnät/Ring vill han ha kvar? Förslag C (lugn lista) byggdes inte. Rutnätets rutor bockas av med tryck, håll in ger bladet.

- Hundbilden (ht-v249–v254): känns animationerna mjuka på iPhone? Huvudvickningen minskades till ≈2° (`.geo-huvud`/`GEO_NACKE`); ta bort eller ändra om han fortfarande ogillar den. Undvik nya rörliga delar i de stilla SVG:erna (`svg.fig-lag`/`svg.bd-lag` är de rörliga) och nya SVG-filter i Geometrisk.
- Inköpssynk mellan telefoner (ht-v252, test `verktyg/emu/inkop-synk.js`): följ upp om fler synkfel syns.
- GPU-lager (`gpuLager`, bara gemensam skärm tills iPhone prövats; `ht.gpu=1/0` tvingar): rör sig Surfacen mjukt?
- Grå väggskärm: kiosken kör Chromium med GPU + vakthund i `kiosk/ljussensor.py`. Följ upp med `journalctl --user -u ljussensor | grep vakt` på Surfacen. Datorn kör XFCE, inte Cinnamon.

## Kräver verklig hårdvara

- UI 3.0 med iPhone-tangentbord och på Surface.
- Adaptiv ljusstyrka på Surface (ht-v163–v169).

## Väntar på Henrik (Kod.gs)

- `rid`-skydd mot dubbletter i `doPost` (ht-v261, [Kod.gs](https://github.com/HenrikLH/hushallstavlan/blob/main/apps-script/Kod.gs)). Appen klarar sig utan; ta bort punkten när Henrik klistrat in och publicerat.
- Tidigare: Henrik bekräftade 2026-10-21 att Kod.gs/setupRecipes/distribution är uppdaterade. Namn/rum på sysslor kan inte ändras utan ny Kod.gs (`cleanSet` tillåter bara freq/min/who/plannedFor/snoozeUntil).

## Beslut som ska bevaras (inte självklara i koden)

- UI 2.0 är standard och ska bevaras; Ateljé är frivilligt UI 4.0, UI 3.0 finns kvar i utvecklarläget.
- Veckosedel: ingen automatisk Ätit-status eller datumspärr; låst borttagning kräver håll in.
- Håll in = lyft (`hlOn/hlOff`); `data-hold`-bekräftelseknappar behåller fyllningen med flit.
- Väderhimlen: vita stjärnor i mörkt läge (gula i ljust), inga stjärnor vid dimma, molnform B+C (Henrik avvisade bubblig och trappstegsformad underkant), molnmängd efter `cloud_area_fraction`.
- Trädet i Geometrisk: tydliga cirklar och starka färger.
- Timerpillret: ingen tid i staplarna (Henriks val).
- Födelsedagar: egna tillägg/färger i `onskelista` (`{fod:1,add,del}`, `col`) läggs ovanpå kalendersynken.
- `installningar.js` faller även på main (gammalt fel, inte orsakat av senare ändringar).
