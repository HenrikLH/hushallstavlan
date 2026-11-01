# Geometrisk med originalets uppbyggnad

Henrik avvisade först förenklade SVG-illustrationer, sedan hela målade landskap och därefter uttonade bildkanter. Kravet är originalets separata komponenter och komposition, med det valda grafiska formspråket. Referensbilder beskriver stilen; sjön, skogen och det rektangulära landskapet används inte i den aktuella scenen.

## Aktuell komposition

- `backdropSvg`: originalets koordinatsystem 230 × 190, små markkullar, tuvor, skugga, årstidsdetaljer och fallande löv. Geometrisk lägger in ett fristående träd vid samma baspunkt (52, 160).
- `grassPatch`: originalets separata markplätt under hundarna, med grässtrån, blommor, löv, frost, vattenpölar, snöfläckar och djup snö. Geometrisk använder sammanhängande färgfält i fyra toner och kortare, bredare tvåtonade gräsblad som passar trädet. Inga bilder tonas ut längs en rektangelkant.
- `figSvg`: samma hundplacering, poser och väderkläder; maskotatlasens fristående hundar med diskret andning. Figuren ligger ovanpå marken. Hundarnas ögon är atlasens egna små mörkbruna ögon med svarta pupiller; inga pålagda irisringar.
- Sol-/månbana, molntäcke/vind, stjärnor, regn/snö/åska/dimma och kalender-/snömodellen är gemensamma med Original. Vädervyn använder också originalets scenmått och placering, inte en fullbred landskapsruta.

## Aktiva bildlager

Tre WebP-atlaser, sammanlagt cirka 736 kB, förladdas offline. Fullständiga storlekar, kontrollsummor och klippkoordinater finns i `vader-bildlager.json`.

- `bilder/vader/trees-v1.webp`: 1536 × 1024, sex 512 × 512-rutor: vårblom, sommar, höst, senhöst, kal vinter, snögrenar. Bildverktyget fick samma stilreferenser och strikt frilagda träd utan mark eller bakgrund. Prompt: `vader-trad-prompt.json`.
- `bilder/vader/mascots-v2.webp`: två franska bulldoggar i 16 väder-/sovlägen. Ursprungliga bruna iris, svarta pupiller och slutna sovögon används direkt.
- `bilder/vader/clouds-v1.webp`: fyra molnformer med rundade ovandelar, rak bas och kort understreck. Gråskalan färgsätts av befintlig dag/natt- och vädermodell.

Hundatlasens mellanrum klipps med uppmätta konturer per bildruta, så att öron och kläder från grannhunden inte följer med. Bildpixlarna ändras inte; klippgeometrin finns i manifestets `sprite.seams` och `GEO_DOG_SEAMS`.

Trädets faktiska stambaser registrerades i manifestet; anta inte att bildgeneratorn följt identiska pixelkoordinater. Varje ruta placeras i originalets trädkoordinater med skala 0,22 i sidled och 0,253 på höjden: trädet är 15 procent högre medan stambasen ligger kvar. Ett träd visas åt gången för att undvika dubbla grenar/ghosting mellan olika teckningar. Kalenderns årstidsvikter och lövtäthet väljer bildruta; fallande löv, marklöv och snö styrs separat. Snö kan därför visas oberoende av månad. Dags-/nattljus följer originalets färgfilter; hundarna har eget ljusfilter.

De tio tidigare landskapsfilerna finns kvar som arbetsreferenser och för kompatibilitet med äldre laddad appkod. De listas under `historicalLandscapes` i manifestet, visas inte och förladdas inte längre av aktuell service worker. Tidigare landskapsprompter i `vader-botanik-prompter.json` hör till dessa referenser.

## Verifiering

`vader-bildstilar.js` provar 1 968 väderkombinationer, årstidsstadier, ljusfaser, snödjup och hundvarianter; verifierar originalets scen-/hundmått, separata träd-/marklager, frånvaro av målade landskap, SVG-resurser och tre avkodade atlaser. Menyval och omstart testas. GPU-pixeljämförelse kompletterar riktiga skärmbilder av översikt/vädervy i ljust/mörkt och på vägg. Endast emulerade data används.
