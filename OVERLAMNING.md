# Aktuell överlämning — 2026-11-04

Claude och Codex: läs AGENTS.md och denna fil (rutinerna finns som skills i `.claude/skills/`). Detaljer om publicerat arbete finns i git-loggen och PR:erna; denna fil har bara aktuell status.

## Börja här

- Aktuell release: **ht-v279**: samma hörnrundning överallt (bara CSS). Inköp, månadsväljaren i Ekonomi, veckans knapp, rätternas rutor, bladen, widgets och receptkort följer Kantiga/Runda/Raka (UI 2/4) och `--r5` (UI 5). Ångra-gren `version-fore-hornrundning`, PR #75. Hitta fler avvikare: `verktyg/emu/radie-koll.js`. Gröna: alla-flikar telefon (UI5, UI2 Runda) + vägg; CI faller bara på gamla `oversikt-manad.js` (handtagets min-height, fel även på main).
- Förra: **ht-v278**: Ta bort i rättens blad (Mat → Vecka) kräver alltid håll in (`dishDelHold`, även efterrätt), tom platshållare i bladhuvuden dold i UI5 (`span.tb`). Ångra-gren `version-fore-ta-bort-hall-in`. Gröna: ta-bort-hall-in, matsedel-gester, alla-flikar telefon+vägg.
- Förra: **ht-v276**: flikradens lins i UI 5.0 lyfts bara vid tryck och glider till ny flik som förberäknad fjäder (R .65, ≈0,4 s, Web Animation; `glid`/`fang` i `navLins`). Ångra-gren `version-fore-lins-tryck`. Gröna: flikrad-lins, alla-flikar telefon+vägg. Följ upp: lagom takt i iPhone?
- ht-v277: hundbilden och sol/månbanan står mitt i kortet i telefonens Översikt oavsett bredd (`--gx` i `placeSky`, Geometrisk). Ångra-gren `version-fore-hundbild-mitten`. Henriks iPhone är 402 px: mät på den bredden.
- Förra: **ht-v273**: Schema i Översikt, dra ned i veckoraden fungerar i iPhone (`.ovcal:not(.expanded) .ovcal-week .wk-sw{touch-action:pan-x}`, drag uppåt scrollar sidan via scrollBy). Ångra-gren `version-fore-schema-iphone`. Gröna: alla-flikar telefon+vägg, kalender-dra-ned (UI5+UI2). Följ upp med Henrik i iPhone.
- Förra: **ht-v272**: flikraden i UI 5.0 har en lins som drivs av fjädrar (`navLins` före drag-IIFE:n i app.js, CSS `.nav.fj`/`.lyft`, `--lins`): tryck lyfter, följer fingret, sträcks efter farten, knack (`u5Tick`) vid flikbyte, fjädrar in vid släpp. Ångra-gren `version-fore-flikrad-lins`, PR #73. Test `verktyg/emu/flikrad-lins.js`, alla-flikar telefon/vägg/UI2 gröna. Följ upp: känns linsen rätt i iPhone? Justera sträckning (/2600, max .28) och lyft (.18/.26).
- Förra: **ht-v271**: Schema i Översikt får 12 px luft ovanför handtaget, och dra ned i veckoraden fäller ut månaden (touch-lyssnare efter motion-grip-hanterarna i app.js; test `verktyg/emu/kalender-dra-ned.js`). Ångra-gren `version-fore-schema-dra-ned`. Gröna: alla-flikar telefon+vägg, kalender-dra-ned (UI5+UI2). Följ upp: känns draget rätt i iPhone?
- Förra: **ht-v270**: Kalender utan den röda datumraden under Dag/Vecka/Månad (`.motion-date-label` borttagen, var dubblett). Ångra-gren `version-fore-kalenderdatum`. Gröna: alla-flikar telefon+vägg, kalender-svep. Förra: **ht-v269** tidsblock i kalendern (se Pågår nu). Förra: **ht-v268**: svep i Kalender-fliken byter månad/vecka/dag (`calSwipe` före `subSwipe`; test `verktyg/emu/kalender-svep.js`). Ångra-gren `version-fore-kalendersvep`. Gröna: alla-flikar telefon+vägg, ui5-gester, kalender-svep (UI5+UI2).
- Förra: **ht-v266**: plusknappen syns på Kalender-fliken (`addContext`), och emu-scenarierna går till Städ via Att göra (`#nav uppgifter` + `taskTab stad`). Ångra-gren `version-fore-kalender-plus`. Gröna: alla-flikar telefon+vägg, plus-alternativ, ui-versioner (`LS={"ui":"2"}`), stad-vyer, stad-plus, hall-in-blad.
- Förra: **ht-v265**: jämn luft (≈12 px) runt draghandtagen i väder (Översikt), Schema och matbudget (`.ovx`/`.ovcal`/`.wcard>.motion-grip` i index.html). Ångra-gren `version-fore-handtag-luft` (= ht-v264). Röktest telefon+vägg grönt.
- Förra: **ht-v264**: UI 5.0 (Apple) är standard. ht-v263: kalendern har egen flik; Uppgifter och Städ delar Att göra (`attSeg`, `S.taskTab` = lista|stad), ångra-gren `version-fore-kalenderflik`.
- ht-v261: inga dubbletter av uppgifter/varor när svaret från arket tappas (`redanSparad`/`osaker`/`n0` i flush/apiPost, `rid` till Kod.gs; test `verktyg/emu/uppgift-dubblett.js`, även `NOCACHE=1`). Ångra-gren `version-fore-dubbletter`.
- Inga pågående uppgifter utöver punkterna nedan. Gör inte om godkända ändringar.
- Strömningen i ChatGPT har avbrutits flera gånger: kontrollera gren/PR/main och Pages innan en avbruten publicering återupptas.

## Pågår nu

- **Tidsblock i kalendern** publicerat ht-v269 (ångra-gren `version-fore-tidsblock`, PR #72): Kalenderns plus och Lägg till öppnar Ny händelse (Händelse|Uppgift, Datum, Heldag, Börjar, Slutar, Vem; `evNyOpen`, `evNew`, `evNewTyp`). Dag- och breda veckovyn: tryck på tom tid = block vid halvtimmen, håll in 0,4 s och dra = start/slut i kvartar (`calNyAttr`, `.cv-ny`). Kod.gs `eventAdd` lägger i Familj-kalendern med "Vem: X" i beskrivningen (läses i `calRows_`). Test `node verktyg/emu/run.js verktyg/emu/kalender-tidsblock.js` (med eller utan NOW) (gas.js har låtsaskalendrar). Nästa: Henrik provar dra i iPhone efter Kod.gs-inklistring.
- **Flytta rutor + widgets** publicerat ht-v267 (ångra-gren `version-fore-widgets`, main före: 6423eb1). Widgets i S/M/L bakom Inställningar → Avancerat → Experimentellt (utvecklarläge, `ht.exp=1`, `expOn()`, `XW`/`layoutX`/`ovX`/`wallX`). Ändra-läget är ett utkast (`ARR0`): Klar sparar och minns förra i `<nyckel>Prev` (Ångra, Föregående, Inställningar → Gå tillbaka). Tester `flytta-rutor.js`, `widgets.js`. Nästa: Henrik provar dragning på iPhone; CI-felen i `oversikt-manad.js`/`ui-versioner.js` fanns redan på main.
- **Översikt-rutor** (Claude): vanliga rutor är standard (ht-v275), widgets ett val (`ht.exp=1`, Inställningar → Översikten). Dra i hörnknappen ändrar storlek. Henrik har inte valt utseende per storlek än (förslag A/B/C i /mnt/project-files/widgets/utseende/). Ring i Städ-rutan och årshjul i Födelsedagar på telefonen prövades och skippades (Henrik: bara om ett bättre upplägg hittas).
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

- Inget. Henrik klistrade in och publicerade Kod.gs från main 2026-11-06 20:06 (med `eventAdd` och `rid`-skyddet).
- Namn/rum på sysslor kan inte ändras utan ny Kod.gs (`cleanSet` tillåter bara freq/min/who/plannedFor/snoozeUntil).

## Beslut som ska bevaras (inte självklara i koden)

- UI 2.0 är standard och ska bevaras; Ateljé är frivilligt UI 4.0, UI 3.0 finns kvar i utvecklarläget.
- Veckosedel: ingen automatisk Ätit-status eller datumspärr; låst borttagning kräver håll in.
- Håll in = lyft (`hlOn/hlOff`); `data-hold`-bekräftelseknappar behåller fyllningen med flit.
- Väderhimlen: vita stjärnor i mörkt läge (gula i ljust), inga stjärnor vid dimma, molnform B+C (Henrik avvisade bubblig och trappstegsformad underkant), molnmängd efter `cloud_area_fraction`.
- Trädet i Geometrisk: tydliga cirklar och starka färger.
- Timerpillret: ingen tid i staplarna (Henriks val).
- Födelsedagar: egna tillägg/färger i `onskelista` (`{fod:1,add,del}`, `col`) läggs ovanpå kalendersynken.
- `installningar.js` faller även på main (gammalt fel, inte orsakat av senare ändringar).
