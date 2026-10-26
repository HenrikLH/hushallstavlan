# Aktuell överlämning — 2026-10-25

Claude och Codex: läs AGENTS.md och denna fil. Repot är gemensamt minne; läs relevant kod/PR vid behov.

## Börja här

- Hämta senaste main. Drift: **ht-v183 / app.js?v=173** (lyft vid håll in i hela appen).
- [Pages-publicering](https://github.com/HenrikLH/hushallstavlan/actions/runs/40094688899) grön; publik sw/index och appens filinnehåll verifierade. Inga öppna PR:er eller ofärdiga implementationer vid överlämningen.
- Nästa steg: Henriks nästa konkreta uppgift eller återkoppling från telefon/Surface. Gör inte om redan godkända rättningar.
- Henrik vill behålla UI 2.0:s tema och gemensamma komponenter. UI 3.0 är frivilligt i utvecklarläget. Bilder före visuella ändringar på main; ”Pusha” är publiceringsgodkännande.
- Strömningen i ChatGPT har avbrutits flera gånger. Kontrollera gren/PR/main och Pages innan en avbruten publicering återupptas. Begär inte samma godkännande igen.

- Nytt 2026-10-25: `node verktyg/karta.js` (kodkarta) och `node verktyg/version.js` (merge + versionshöjning); regler i AGENTS.md avsnitt 9.

## Beteende som ska bevaras

- Plusplacering per enhet (ht.addPlace): Flytande / Vid profilen / Vid raden. Receptplus öppnar Nytt recept/Importera. Städ: Vid profilen flyttar pluset till huvudet och döljer endast övre Ny syssla-raden; övriga två behåller raden, rumsfält kvar. [PR #27](https://github.com/HenrikLH/hushallstavlan/pull/27), [#28](https://github.com/HenrikLH/hushallstavlan/pull/28).
- Recept: neutralt förstoringsglas; kombinerbara filter, återställning/resultatantal/tomlägen, separat filterminne per underflik. Arkiv är separat navigering vid Mina recept. Bevara favoriter, sparat/arkiv/återställning, import/synk och utkast. Orörda tomma utkast städas; ny efterrätt får rätt kategori.
- Veckosedel: **ingen automatisk Ätit-status eller datumspärr**. Efter torsdag kan vardagsrätter fortfarande tas bort/låsas. Vänstersvep visar Ta bort, högersvep och hålltryck låser/låser upp. Båda låsstilarna (rätt/bild) fungerar; låst borttagning kräver bekräftelse. [PR #29](https://github.com/HenrikLH/hushallstavlan/pull/29).
- Lilla väderremsan: tunn linje före midnatt och dag + 00, ingen vald bakgrund; även när midnatt är första timmen. Scroll/väderlänk kvar. PR #30 ersätter stängda #20; inget väderarbete väntar längre.
- Födelsedagar (ht-v179): plus öppnar bladet Ny födelsedag (namn, dag, månad, år) och följer plusplaceringen; svep vänster tar bort med 5 s Ångra. Egna tillägg/borttag ligger i `onskelista` som `{fod:1,add,del}` och läggs ovanpå kalendersynkens `fodelsedagar`, så synken skriver aldrig över dem. Test: verktyg/emu/fodelsedagar.js. Ångra-gren version-fore-fodelsedagar-20261024.
- Håll in = lyft (ht-v183, Henriks val): `hlOn/hlOff` + `.hl-on` (4 % på 0,8 s med skugga). Används av `data-hold-lift` (födelsedagar), låsning `data-hold-lock` (veckosedel/efterrätt/Veckoförslag; strecket borttaget), Översiktens ordna-rutor (1,02 under 0,6 s) och väggklockans stäng-gest (3 s). `data-hold`-bekräftelseknapparna behåller fyllningen med flit. Födelsedagar: håll in öppnar Ändra födelsedag (namn/datum/år/färg, Ta bort). Egen färg i `onskelista` `col:{'namn|MM-DD':färg}`; barn under 18 med känt födelseår får `BD_BARN` (orange) utan egen färg. Ångra-gren version-fore-fodelsedagsfarger.
- **Väntar på Henrik (dator):** klistra in Kod.gs med `CAL_DAYS = 366` (kalendern ett år framåt i stället för 31 dagar) och publicera ny version. Ingen setup behövs. Ta bort punkten när han bekräftat.
- Henrik bekräftade 2026-10-21 att Kod.gs/setupRecipes/distribution är uppdaterade. Receptlagring/server/import: docs/recipe-management-release.md. Ingen riktig hushållsdata ändrad av agenten.

## Verifiering och återställning

- verktyg/emu/stad-plus.js: telefon/vägg × ljust/mörkt inkl. UI3; inställningar/omstart/Avbryt/två sparvägar. ui-versioner.js godkänd. Bilder outputs/stad-plus-profil/.
- verktyg/emu/matsedel-gester.js: torsdag–lördag, telefon/vägg × ljust/mörkt; båda låsstilarna via inställningar/omladdning, hålltryck/svep, låst bekräftelse/Avbryt, sparning efter omladdning. Alla-flikar telefon/vägg godkända på appkoden i #29. Bilder outputs/matsedel-gester/.
- verktyg/emu/vader-dygn.js: ljust/mörkt på vägg, dygnsgräns inkl. första timmen, scroll/väderlänk; alla-flikar telefon godkända på appkoden i #30. Bilder outputs/vader-dygn/. Testerna använder låtsasdata.
- Ångra-grenar: version-fore-lyft-overallt (ht-v182), version-fore-lyft-animation (ht-v181), version-fore-fodelsedagsfarger (ht-v179), version-fore-fodelsedagar-20261024 (ht-v178), version-fore-vader-dygn-20261024 (ht-v177), version-fore-matsedel-gester-20261024 (ht-v176), version-fore-stad-plus-20261023 (ht-v175).

## Kräver verklig hårdvara

- Henrik: bekräfta UI 3.0 med iPhone-tangentbord och på Surface.
- Henrik: bekräfta adaptiv ljusstyrka på Surface (ht-v163–v169). Kan inte verifieras i molnet.
