# Aktuell överlämning — 2026-10-24

Claude och Codex: läs AGENTS.md och denna fil. Repot är gemensamt minne; läs relevant kod/PR vid behov.

## Börja här

- Hämta senaste main. Drift: **ht-v178 / app.js?v=169 / matvaror.js?v=9**, appcommit 547281d, [PR #30](https://github.com/HenrikLH/hushallstavlan/pull/30).
- [Pages-publicering](https://github.com/HenrikLH/hushallstavlan/actions/runs/40094688899) grön; publik sw/index och appens filinnehåll verifierade. Inga öppna PR:er eller ofärdiga implementationer vid överlämningen.
- Nästa steg: Henriks nästa konkreta uppgift eller återkoppling från telefon/Surface. Gör inte om redan godkända rättningar.
- Henrik vill behålla UI 2.0:s tema och gemensamma komponenter. UI 3.0 är frivilligt i utvecklarläget. Bilder före visuella ändringar på main; ”Pusha” är publiceringsgodkännande.
- Strömningen i ChatGPT har avbrutits flera gånger. Kontrollera gren/PR/main och Pages innan en avbruten publicering återupptas. Begär inte samma godkännande igen.

## Pågår: priser efter förpackning (Claude)

- Mål (Henrik 2026-10-24): inga varor utan pris. Inköp = hela förpackningar som köps, pris/portion = använd mängd.
- Gren `claude/project-thread-646pna`, PR mot main, ht-v179 / app.js?v=170 / matvaror.js?v=10. Väntar på Henriks ”Pusha” efter bilder.
- matvaror.js: riktig förpackning ur `priser` (nytt `fp`-format eller tolkat ur produktnamnet), SK = skafferipriser, `anvant`; styckvikter (gst) för blomkål m.fl. app.js: `shopKr` (pris för rader utan pris), `portKr`/`veckaAnvant` (per portion), efterrättens rader med förpackningspris.
- **Väntar på Henrik:** klistra in apps-script/Kod.gs (willysPris_ väljer förpackningen som är billigast för standardmängden, prisar skafferi och egna varor, skriver `fp`) och kör `startaPrisSynk`. Utan den används gamla priser, då kan stora säckar (5 kg potatis) synas.
- Test: alla-flikar telefon/vägg/mörkt, recept-ui/-reliability/-legacy, matsedel-gester och recept-server gröna lokalt på grenen.

## Beteende som ska bevaras

- Plusplacering per enhet (ht.addPlace): Flytande / Vid profilen / Vid raden. Receptplus öppnar Nytt recept/Importera. Städ: Vid profilen flyttar pluset till huvudet och döljer endast övre Ny syssla-raden; övriga två behåller raden, rumsfält kvar. [PR #27](https://github.com/HenrikLH/hushallstavlan/pull/27), [#28](https://github.com/HenrikLH/hushallstavlan/pull/28).
- Recept: neutralt förstoringsglas; kombinerbara filter, återställning/resultatantal/tomlägen, separat filterminne per underflik. Arkiv är separat navigering vid Mina recept. Bevara favoriter, sparat/arkiv/återställning, import/synk och utkast. Orörda tomma utkast städas; ny efterrätt får rätt kategori.
- Veckosedel: **ingen automatisk Ätit-status eller datumspärr**. Efter torsdag kan vardagsrätter fortfarande tas bort/låsas. Vänstersvep visar Ta bort, högersvep och hålltryck låser/låser upp. Båda låsstilarna (rätt/bild) fungerar; låst borttagning kräver bekräftelse. [PR #29](https://github.com/HenrikLH/hushallstavlan/pull/29).
- Lilla väderremsan: tunn linje före midnatt och dag + 00, ingen vald bakgrund; även när midnatt är första timmen. Scroll/väderlänk kvar. PR #30 ersätter stängda #20; inget väderarbete väntar längre.
- Inga nya Kod.gs-steg krävs. Henrik bekräftade 2026-10-21 att Kod.gs/setupRecipes/distribution är uppdaterade. Receptlagring/server/import: docs/recipe-management-release.md. Ingen riktig hushållsdata ändrad av agenten.

## Verifiering och återställning

- verktyg/emu/stad-plus.js: telefon/vägg × ljust/mörkt inkl. UI3; inställningar/omstart/Avbryt/två sparvägar. ui-versioner.js godkänd. Bilder outputs/stad-plus-profil/.
- verktyg/emu/matsedel-gester.js: torsdag–lördag, telefon/vägg × ljust/mörkt; båda låsstilarna via inställningar/omladdning, hålltryck/svep, låst bekräftelse/Avbryt, sparning efter omladdning. Alla-flikar telefon/vägg godkända på appkoden i #29. Bilder outputs/matsedel-gester/.
- verktyg/emu/vader-dygn.js: ljust/mörkt på vägg, dygnsgräns inkl. första timmen, scroll/väderlänk; alla-flikar telefon godkända på appkoden i #30. Bilder outputs/vader-dygn/. Testerna använder låtsasdata.
- Ångra-grenar: version-fore-vader-dygn-20261024 (ht-v177), version-fore-matsedel-gester-20261024 (ht-v176), version-fore-stad-plus-20261023 (ht-v175).

## Kräver verklig hårdvara

- Henrik: bekräfta UI 3.0 med iPhone-tangentbord och på Surface.
- Henrik: bekräfta adaptiv ljusstyrka på Surface (ht-v163–v169). Kan inte verifieras i molnet.
