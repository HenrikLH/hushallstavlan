# Recept: plan inför designgodkännande

Status: endast analys, plan och fristående ljusa skisser. Ingen appfunktion implementerad. Ingenting får publiceras utan Henriks uttryckliga ”Pusha”.

Ägare: Codex. Gren: `codex/recipe-management-plan`. Bas: `003680f` (main vid genomgången). Väderändringen ligger separat i PR #20.

## Beslut och förutsättningar

- Bekräftat av Henrik: en receptändring lämnar redan planerade måltider orörda. En separat åtgärd erbjuder uppdatering av valda måltider, med förhandsvisning av inköpslistan.
- Föreslaget, inte bekräftat: första importversionen behöver ingen betald AI-tjänst. Strukturerade receptsidor stöds; inklistrad text är reservvägen. Avvakta svar innan eventuell AI-integration.
- Design ska godkännas innan produktionskod skrivs. Godkänd design ger inte publiceringstillstånd.
- Designstyrning från Henrik: skisserna ska visa **Runda + Piller**. Receptvyerna ska återanvända appens gemensamma formval, färger, typografi, mellanrum och navigation; ingen separat receptdesign. Runda innebär kort med 26 px radie och kapslade kontroller/åtgärdsknappar. Piller är huvudmenyn med Mat/Ekonomi/Översikt/Uppgifter/Städ, inte Mat-delens underflikar; utfällt och kompakt scrolläge ska visas.
- Behåll svenska UI 2.0, befintlig navigering och fungerande UI 1.0/3.0. Ingen ramverksändring eller omformatering av app.js.
- Planen är för nuvarande hushållslagring. Konton för flera oberoende hushåll är ett separat projekt.

## 1. Vad som finns och kan återanvändas

| Område | Finns | Behöver kompletteras |
|---|---|---|
| Receptdata | Receptfliken i Sheets, snapshots i Inställningar/receptbank_N och inspiration.json | Ett gemensamt uppslag och versionshantering |
| Detaljvy | Ingrediensgrupper, portionsskalning, steg, stegvisa timers, proteinvarianter, källänk när `src` finns | Skapa/redigera och tydlig källa/pristäckning |
| Foto | Förminskning på enheten och uppladdning till Drive | Foto i utkast, spara kopplingen först vid bekräftelse, behåll gamla versioners bilder |
| Receptbank | Bokmärken, favoriter, betyg och önskemål | Skilj sparat, redigerat, arkiverat och ”föreslå aldrig igen” |
| Hitta recept | Befintliga kategori-/kostfilter; titelsökning bara i UI 3.0 | Gemensam sökning och filter i standardvyn |
| Import | Inspirationsfil och manuellt införda Sheets-recept | Länk-/textimport med granskning och dubblettvarning |
| Synk | Lokal cache, utkorg, uppdatering ungefär var 30:e sekund när appen syns | Versionskonflikter, kvittenser och kvarvarande misslyckade receptändringar |
| Inköp/priser | Portions- och förpackningsberäkning, lager, hämtade priser och reservpriser | Ärliga prisetiketter och kontrollerad uppdatering av planerade måltider |

Konkreta fynd: `recipeById` väljer Sheets före receptbank, medan `allRecipes` väljer receptbank före Sheets. `recipeRow_`/`parseRecipe_` bevarar inte alla fält, till exempel källa/foto. Okända varor får idag ett internt reservpris på 20 kr i planeringen. Sådana skillnader måste lösas innan redigering läggs ovanpå.

## 2. Rekommenderad lagring och kompatibilitet

Behåll samma Google-kalkylark och de befintliga flikarna. Lägg till två flikar genom en säker, upprepningsbar setup:

- **Receptregister:** ett stabilt recept-id, pekare till senaste version, revisionsnummer, arkivstatus och ursprung (Sheets, inspiration, receptbank eller eget). Detta är hushållets biblioteksregister.
- **Receptversioner:** oföränderliga versioner med versions-id, stabilt recept-id, versionsnummer, datum och komplett receptinnehåll. Dela större innehåll i definierade kolumner; respektera cellgränser och avvisa för stora poster tydligt, aldrig tyst trunkering.

Innehållet innehåller titel, foto, portioner, total tid samt valfria förberedelse-/tillagningstider, befintlig måltids-/planeringskategori, kostetikett, ingrediensgrupper, ingredienser (mängd, enhet, namn, originaltext), ordnade steg, timers, tips, frysbarhet, källadress och källnamn. Nya valfria fält ska inte skriva över äldre när något annat redigeras. Behåll proteinvarianter och andra befintliga specialfält.

### Befintliga recept

1. Läs gamla källor via en adapter utan att skriva om kalkylarket vid vanlig uppstart.
2. Använd ett bestämt uppslag för bibliotek, planering, detaljvy, foton och matlagningsläge. Skilj aktuell biblioteksversion från exakt planerad version.
3. Vid första redigering: frys den gamla effektiva versionen under dess befintliga id; skapa en ny version och ett registerhuvud. Gamla menyrader fortsätter peka på den frysta versionen.
4. Betyg, favoriter, önskemål och tillagningshistorik kopplas till det stabila recept-id:t. Lägg en adapter för äldre nycklar så att historik inte försvinner eller dubbleras.
5. Inspirationen ändras aldrig globalt. Redigering skapar hushållets egen anpassning med bibehållen källa. En uttrycklig ”Spara som nytt recept” skapar ett separat recept.
6. Inga automatiska sammanslagningar av olika id:n. Om samma id redan har olika innehåll i äldre källor: bevara båda i säkerhetskopian och erbjud ett tydligt val vid första redigering.
7. Behåll de befintliga receptbanksraderna och deras favoriter/foton under övergången. Nya versioner ska inte fortsätta sparas som konkurrerande fullständiga bankkopior.

### Planerade måltider

Matsedeln ska peka på en exakt receptversion. Biblioteket visar den senaste. En bibliotekssparning ändrar därför inte menyn, portionsantalet, ingredienserna eller inköpslistan.

Vid ”Uppdatera planerade måltider” väljer användaren vilka måltider som ska byta version. Visa gamla/nya ingredienser, mängder, prisosäkerhet och vilka listposter som påverkas. Behåll egna varor, köpta varor, andra måltiders behov och lager. Köpta varor som inte längre behövs märks som redan köpta, inte som om de aldrig handlats. Storkok och delade ingredienser räknas bara en gång enligt befintliga portionsregler.

Den nya versionens snapshot kan materialiseras i den gamla Receptfliken med ett nytt versions-id när den planeras, så att äldre läsare kan visa måltiden. Bekräfta detta i kompatibilitetstester; äldre klienters förmåga att redigera nya versioner garanteras inte. Inför sådan redigering uppmanas användaren att uppdatera appen. Behåll originalraderna.

### Synk och fel

- Servern validerar och sparar under befintligt lås. Varje operation har en unik kvittensnyckel och förväntad revision; återförsök får inte skapa extra recept eller versioner.
- Använd en begränsad journal för kvittenser och återhämtning. Sheets har inte databastransaktioner: skriv först komplett version, därefter registerpekaren; ett avbrott får inte göra en halv version till aktuell. Samma princip för meny/listuppdatering och återhämtning efter avbrott.
- Två enheter som redigerar samma revision ger ett konfliktbesked, inte tyst ”senast vinner”. Visa båda versionerna och erbjud att behålla utkastet som separat kopia.
- Utkast ligger lokalt, separat från sparade recept, med hushåll, recept-id, basrevision, formatversion och tid. Spara inte råimport i vanliga loggar. Utkast följer inte automatiskt med till annan enhet.
- Utan nät: skapa/redigera text och spara lokalt. ”Väntar på nät” skiljs från ”Sparat i hushållet”. Ett avvisat sparförsök ligger kvar med retry och felorsak. Byt inte hushåll med en gammal operation kopplad till det nya hushållet.
- URL-import och bilduppladdning kräver nät. Fotoändringen ersätter inte ett fungerande gammalt foto förrän både uppladdning och receptsparning lyckats. Undvik att lägga bilddata i localStorage; om offlinebilder tas med krävs separat bloblagring och kvotkontroll.

## 3. Steg för steg: beroenden och godkännandekriterier

### Steg 1 – Baslinje, design och beslut

Inventera alla receptläsare/skrivare inklusive planSend, menuSwap, proteinval, betyg, receptbank, foto och inköpsberäkning. Spara representativa testdata från alla tre källorna. Visa ljusa skisser för bibliotek, redigering, import/granskning och meny/listuppdatering.

**Klart när:** användaren har godkänt design och de nödvändiga produktvalen; gamla beteenden är dokumenterade. Ingen riktig funktion kodas före det.

### Steg 2 – Receptmodell och ett gemensamt uppslag

Bygg adapter och normalisering med bevarade okända/specialfält. Separera stabil identitet, bibliotekets senaste version och planerad snapshot. Återanvänd ingrediens-/stegformatet i nuvarande app. Definiera gränser för längder, antal rader och totalt sparat innehåll.

**Beroende:** steg 1. **Klart när:** samma recept visas konsekvent från alla vyer, gamla måltider och skalning fungerar, och inga gamla data skrivs om vid läsning.

### Steg 3 – Säker serverlagring och funktionskontroll

Lägg till additiva register-/versionsflikar samt operationer för spara, arkivera/återställ och granskad menyuppdatering. Servern returnerar funktionsversion så klienten vet vad som stöds. Validera även på servern, med revision, kvittens och återhämtning enligt ovan.

**Beroende:** steg 2. **Klart när:** upprepat setup inte ändrar befintliga data, samma request två gånger bara sparar en gång, samtidig ändring upptäcks och äldre Kod.gs fortsätter användas för nuvarande funktioner. Nya skrivknappar spärras med begriplig hjälp tills servern stöder dem.

**Henrik behöver senare:** klistra in den uppdaterade `apps-script/Kod.gs`, köra anvisad setup och publicera ny serverversion. Detta görs först efter separat publiceringsgodkännande, med säkerhetskopia och stegvis kontroll. Planen ändrar inte Google-data nu.

### Steg 4 – Skapa och redigera manuellt

Återanvänd ett formulär för nytt recept, redigering och importgranskning. Tydlig Avbryt/Spara, lokalt autosparat utkast, återuppta, varning vid att lämna och möjlighet att kasta utkast. Foto valfritt. Visa ”Sparar”, ”Väntar på nät”, ”Sparat” och kvarvarande fel.

Obligatoriskt för ett färdigt recept: titel, positivt portionsantal, minst en ingrediens och ett instruktionsteg. Tid får vara okänd; visa inte 0 min som fakta. Tillåt svenska decimaler, vanliga bråk, mängdintervall och ”efter smak” som bevarad text. Oklara mängder flaggas och räknas inte som exakta. Visa ordnade steg samt enkla flytta-upp/ned-knappar. Specialinstruktioner med kött/veg får inte plattas bort.

**Beroende:** steg 2–3. **Klart när:** skapa, ändra samtliga efterfrågade fält, avbryt, återuppta, återförsök och konflikt fungerar på telefon; befintliga recept, foton och betyg bevaras.

### Steg 5 – Sök och filter i standardvyn

Behåll Mat-flikens struktur. Lägg synlig sökruta och ”Nytt recept” i receptbiblioteket/receptbanken, med ”Importera” som tydlig åtgärd. Gemensam sökning efter titel och ingrediens. Filter för sparade/inspiration, favoriter, befintliga kostkategorier, vardag/storkok/efterrätt och maxtid. Oklart kostinnehåll är ”Ej angivet”, aldrig gissat allergenfritt. Synliga aktiva filter, resultatantal och ”Rensa filter”; behåll sökning och scroll efter att ett recept öppnats.

**Beroende:** steg 2; nytt/redigera kräver steg 4. **Klart när:** kombinerade filter, å/ä/ö, inga träffar och tillbaka-navigering fungerar även i UI 2.0 utan att ändra andra Mat-vyer.

### Steg 6 – Prisernas ursprung och täckning

Återanvänd MatVaror/Willys, men märk ursprunget: hämtat butikspris med datum/butik, uppskattat baspris eller saknat pris. Även butiksbaserad receptkostnad är en uppskattning eftersom produkter/förpackningar kan variera. Visa exempelvis ”Ca 24 kr/portion · pris saknas för 1 ingrediens”; ofullständig summa är ”Känd delkostnad”, inte ett komplett totalpris.

Behåll ett internt reservvärde endast där planeringsalgoritmen behöver det, uttryckligen skilt från kända priser. Visa inte reservvärdet som hämtat pris och låt inte ett budgetförslag med ofullständiga priser se garanterat ut. Behåll ursprunglig receptkostnad som uppskattning med källa, inte som aktuell butiksfakta.

**Beroende:** steg 2. **Klart när:** saknad vara, gammalt pris, pantry-vara och blandad täckning är begripliga i recept, planering och shopping utan att en okänd vara blir gratis.

### Steg 7 – Inklistrad text till granskningsutkast

Erbjud ”Klistra in text”, valfri källadress och en lokal parser för tydliga rubriker, ingrediensrader och numrerade steg. Ingen AI-funktion antas. Spara originaltext i utkastet och markera osäkra fält. Om texten inte går att dela upp, låt användaren själv ange ingredienser/steg. Ingenting sparas i biblioteket innan granskningen bekräftats.

**Beroende:** steg 4. **Klart när:** svensk decimal, bråk, saknade portioner och otydlig text aldrig ger uppdiktade mängder/instruktioner; utkast kan korrigeras eller kastas.

### Steg 8 – Webbimport med tydliga begränsningar

Google-tjänsten hämtar en sida och extraherar Schema.org Recipe i JSON-LD (inklusive @graph, flera recept, HowToStep/HowToSection, ingredient text, yield och ISO-tider). Flera recept ger ett val. Ingen hämtad JavaScript körs och HTML renderas inte som betrott innehåll. Testa parsern på sparade fixtures så att tester inte är beroende av en levande sajt.

För första versionen rekommenderas en liten lista med verifierade receptdomäner. Kontrollera HTTPS, värd och varje omdirigering; avvisa privata/lokala adresser, inloggningsuppgifter, osäkra protokoll och för stora svar. Sätt gränser för antal omdirigeringar och behandlat innehåll, återförsök och frekvens. Apps Script saknar ett enkelt universellt domän-/nätverksskydd för godtycklig URL-import; om säkra begränsningar inte kan uppfyllas i vald miljö ska import begränsas ytterligare eller flyttas till en kontrollerad tjänst, inte kringgå skyddet.

Kräv nät och ge timeout-/felstatus. Inloggningskrav, betalvägg, botblockering, Instagram/video och sidor utan användbar strukturerad data har ingen supportgaranti. Erbjud textinmatning direkt med länk och utkast bevarade. En källänk innebär inte att en bild får kopieras; första versionen hämtar ingen fjärrbild automatiskt. Användaren kan lägga till eget foto.

**Beroende:** steg 3, 4, 7. **Klart när:** stödd fixture ger korrekt granskningsutkast; blockerad, tom, felaktig, flera recept och omdirigerad sida hanteras utan bibliotekssparning eller förlorad input.

### Steg 9 – Dubbletter och källor

Kontrollera normaliserad källadress samt likhet i titel och ingredienser. Samma källa är en stark varning, inte bevis för identiskt innehåll. Avlägsna bara kända spårningsparametrar för jämförelse; bevara den användbara ursprungslänken. Undvik att förstöra parametrar som identifierar själva receptet.

Visa befintligt recept, ”Öppna befintligt”, ”Fortsätt redigera utkastet” och ett uttryckligt ”Spara som separat recept”. Ersätt aldrig automatiskt. Kör kontroll både i utkast och vid serverns sparning så att samtidiga importer fångas. En varning får kunna godkännas som en avsiktlig variant.

**Beroende:** steg 3–4, 7–8 för importer. **Klart när:** samma länk med spårning, nära titel och avsiktlig variant får rätt beteende; en källa finns kvar efter spara, ändra, synk och planering.

### Steg 10 – Explicit uppdatering av meny och inköp

Efter bibliotekssparning: ”Sparat. Veckans måltider är oförändrade.” Visa separat ”Visa planerade måltider”. Låt användaren välja måltider och granska additions-/mängd-/borttagningsändringar. Ny synk innan bekräftelse; om menyn eller listan ändrats på annan enhet krävs ny förhandsvisning.

**Beroende:** steg 2–4, 6. **Klart när:** en redigering ensam aldrig ändrar plan/lista; en godkänd uppdatering påverkar exakt valda måltider, bevarar egna/köpta varor och andra måltiders ingredienser, och går att återhämta efter avbruten begäran.

### Steg 11 – Arkivera, ångra och återställ

Skilj ”Ta bort från sparade”, ”Föreslå inte igen” och ”Arkivera mitt recept”. Arkivering döljer biblioteksposten utan att ta bort versioner som menyn behöver. Ge Ångra och en enkel vy för arkiverade recept. Bevara källor, betyg och fotoreferenser. Permanent radering och rensning av oanvända bilder är en senare separat funktion.

**Beroende:** steg 3–5. **Klart när:** oavsiktlig arkivering kan återställas även efter omladdning; planerade måltider går fortfarande att öppna/laga.

### Steg 12 – Kontroll, verkliga bilder och publiceringsgrind

Kör befintliga alla-flikar-/funktionskontroller och nya tester för faktiska risker. UI 2.0:s receptvyer får avsiktligt ändras; granska deras bilder separat i stället för att släppa alla visuella regressioner. Oförändrade vyer ska behålla tidigare utseende.

Testmatris: telefon ljust/mörkt och vägg ljust/mörkt; relevant UI 1.0/3.0-kompatibilitet; gammal/uppdaterad Kod.gs; offline/återanslutning; två enheter; förlorat serversvar; gammalt recept från varje källa; samma id med olika snapshots; planerad portion/protein/storkok; ångra/återställ; importens felvägar; stora data och full lagring. Riktigt iPhone-tangentbord och Surface kräver Henriks hårdvarukontroll.

Designmatris: verifiera Kantiga/Runda/Raka tillsammans med Fast/Svävande/Piller där recepten visas. Kontrollera gemensamma hörnradier, knappar, aktiva val, menyposition, mellanrum, textstorlekar, formulär, laddning/fel och hjälp mot befintliga Mat-, Översikt-, Uppgifter-, Städ- och Ekonomivyer. Ny receptkod ska använda de befintliga stilklasserna så att sparade enhetsval gäller genomgående. Det innebär ingen ny omdesign av övriga sidor i detta uppdrag.

Visa faktiska ljusa screenshots av genomförandet och redovisa testad commit, resultat, begränsningar och nödvändig serveruppdatering. Spara arbetsgren/PR och överlämning. Vänta på ”Pusha”. Därefter: hämta aktuell main, ordna backup, kör godkänd serveruppdatering först med bakåtkompatibilitet, höj appversionen enligt AGENTS.md, skapa ångra-gren, publicera och verifiera Pages. En serverändring är också publicering och får inte ske i förväg.

## 4. Första leveransen och senare förbättringar

**Första fullständiga receptleveransen:** stegen ovan, inklusive begränsad länkimport, textgranskning, redigering, standard-sök/filter, dubblettvarning, källa, prisosäkerhet, versionskonflikt, säkra utkast, arkivering och granskad menyuppdatering. Kan byggas i mindre PR:er men ingen del publiceras automatiskt.

**Senare:** AI-tolkning av svår text, foto/OCR och video, fler verifierade importdomäner, full användarvy för versionshistorik, större receptsamlingars paginering, egen näringsberäkning, delning mellan hushåll, avancerade filter och permanent radering med bildstädning. Ingen automatisk allergenfri-garanti eller universell importer utlovas.

## 5. Källor och skisser

- Befintliga funktioner: `app.js`, `apps-script/Kod.gs`, `matvaror.js`, `matpoang.js`, `restpoang.js`, `inspiration.json` och emulatorn.
- Recipe-format: https://schema.org/Recipe
- Strukturerade recept och instruktioner: https://developers.google.com/search/docs/appearance/structured-data/recipe
- Serverhämtning: https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
- Fristående svensk ljus prototyp: `docs/mockups/recipe-management.html`. Exempelvärden är påhittade, inga riktiga hushållsdata läses eller sparas. Bilder av de fyra flödena genereras separat för designgranskning.
