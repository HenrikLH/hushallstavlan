# Geometrisk med sammanhängande gräsmark av rundlar

Henrik avvisade först förenklade SVG-illustrationer, sedan hela målade landskap och därefter uttonade bildkanter. Kravet är originalets separata komponenter och komposition, med det valda grafiska formspråket. Referensbilder beskriver stilen; sjön, skogen och det rektangulära landskapet används inte i den aktuella scenen.

## Aktuell komposition

- `backdropSvg`/`geoGroundSvg`: en sammanhängande yta av tolv överlappande ellipser, som en illustrerad regnpöl med gräs. Tre nivåer av cirkulära färgfläckar, oregelbundna utlöpare, små fristående fläckar och grästuvor ger djup utan ett disigt landskapslager. Alfamasken tonar bara den oregelbundna ytterkanten (1,25 enheters kantutjämning); innerytorna behåller färgstyrkan. Paletten följer årstid, frost, väta och snödjup; snötäckt mark har inga extra grästuvor. Trädet har bas (28,151).
- `grassPatch`: den godkända gräsplätten under hundarna med geometriska tuvor, blommor, löv, frost, pölar och snö. Den sammanhängande marken binder ihop trädet och hundarna. Ingen större mask läggs över hela bilden.
- `figSvg`: samma hundplacering, poser och väderkläder; maskotatlasens fristående hundar med diskret andning. Figuren ligger ovanpå marken. Hundarnas ögon är atlasens egna små mörkbruna ögon med svarta pupiller; inga pålagda irisringar.
- Sol-/månbana, molntäcke/vind, stjärnor, regn/snö/åska/dimma och kalender-/snömodellen är gemensamma med Original. Vädervyn använder också originalets scenmått och placering, inte en fullbred landskapsruta.

## Aktiva bildlager

Tre WebP-atlaser, sammanlagt cirka 736 kB, förladdas offline. Fullständiga storlekar, kontrollsummor och klippkoordinater finns i `vader-bildlager.json`.

- `bilder/vader/trees-v1.webp`: 1536 × 1024, sex 512 × 512-rutor: vårblom, sommar, höst, senhöst, kal vinter, snögrenar. Bildverktyget fick samma stilreferenser och strikt frilagda träd utan mark eller bakgrund. Prompt: `vader-trad-prompt.json`.
- `bilder/vader/mascots-v2.webp`: två franska bulldoggar i 16 väder-/sovlägen. Ursprungliga bruna iris, svarta pupiller och slutna sovögon används direkt.
- `bilder/vader/clouds-v1.webp`: fyra molnformer med rundade ovandelar, rak bas och kort understreck. Gråskalan färgsätts av befintlig dag/natt- och vädermodell.
- Appen använder `trees-v2`/`mascots-v3`/`clouds-v2`: samma ark med alfakanten bortskuren i förväg (träd: 3a−2, hundar/moln: 5a−4) så att inga alfafilter behöver köras vid varje omritning. v1/v2-filerna ovan är källorna.

Hundatlasens mellanrum klipps med uppmätta konturer per bildruta, så att öron och kläder från grannhunden inte följer med. Bildpixlarna ändras inte; klippgeometrin finns i manifestets `sprite.seams` och `GEO_DOG_SEAMS`.

Trädets faktiska stambaser registrerades i manifestet; anta inte att bildgeneratorn följt identiska pixelkoordinater. Varje ruta placeras i originalets trädkoordinater med likformig skala 0,18 på kronan. Kronan flyttas 20 scenenheter upp utan ändrade proportioner. Endast de nedersta 60 atlaspixlarna av den raka stammen förlängs ned till den fasta stambasen (28,151). Ett träd visas åt gången för att undvika dubbla grenar/ghosting mellan olika teckningar. Kalenderns årstidsvikter och lövtäthet väljer bildruta; fallande löv, marklöv och snö styrs separat. Snö kan därför visas oberoende av månad. Dags-/nattljus följer originalets färgfilter; hundarna har eget ljusfilter.

De tio tidigare landskapsfilerna finns kvar som arbetsreferenser och för kompatibilitet med äldre laddad appkod. De listas under `historicalLandscapes` i manifestet, visas inte och förladdas inte längre av aktuell service worker. Tidigare landskapsprompter i `vader-botanik-prompter.json` hör till dessa referenser.

## Verifiering

`vader-bildstilar.js` provar 1 968 väderkombinationer, årstidsstadier, ljusfaser, snödjup och hundvarianter; verifierar originalets scen-/hundmått, separata träd-/marklager, frånvaro av målade landskap, SVG-resurser och tre avkodade atlaser. Menyval och omstart testas. GPU-pixeljämförelse kompletterar riktiga skärmbilder av översikt/vädervy i ljust/mörkt och på vägg. Endast emulerade data används.

Översiktens Geometrisk-bild är 10 procent större på telefon/vägg. Trädet står vid (28,151), längre åt vänster och bakåt, med skugga, snökant, marklöv och fallande löv. Vädervyns bildmått och trädets krona/längre stam är oförändrade.
