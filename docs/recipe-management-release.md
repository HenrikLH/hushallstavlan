# Recept: implementation inför publiceringsbeslut

Gren: `codex/recipe-management`. Designunderlag: PR #21. Ingen ändring är publicerad och inga riktiga Google-data har ändrats. Publicering kräver Henriks uttryckliga **Pusha**.

## Vad som finns

- Skapa och redigera namn, eget foto, portioner, total-/förberedelse-/tillagningstid, kategori/kost, ingrediensgrupper, mängder, instruktioner, stegordning, timer, källa och tips.
- Gemensam sökning på namn/ingredienser, favoriter, högst 30 minuter och befintliga kategorier i standardgränssnittet. Återanvänder appens form- och menyval, inklusive Runda + Piller.
- Import från länk eller inklistrad text öppnar ett granskningsutkast. Ingenting sparas automatiskt. Liknande titel/källa/ingredienser ger varning; egen variant kräver uttrycklig bekräftelse.
- Arkivering och återställning i stället för permanent radering. Arkiverade recept föreslås inte i nya veckoplaner. Redan planerade recept fungerar fortfarande.
- Uppskattade priser och saknade priser/mängder märks. Osäkra mängder blir inte påhittade mängder. Sådana nya recept undantas från automatiska budgetförslag tills mängderna har rättats.

## Vad kommunicerar med vad?

Telefonen/väggskärmen läser och skriver via den befintliga Google Apps Script-webbappen till hushållets kalkylark. Tre nya flikar används: **Receptregister** pekar på senaste version, **Receptversioner** innehåller innehållet i varje sparad version, **Receptjournal** gör återförsök och avbrutna skrivningar säkrare. Varje recept behåller en stabil identitet även när innehållet får en ny version.

Andra enheter får sparade ändringar via appens vanliga uppdatering. Om två enheter redigerar samtidigt stoppas den senare sparningen med ett val att öppna senaste versionen eller spara en egen kopia. Ingen automatisk överskrivning. Det finns ingen direktkoppling mellan telefonerna.

Ett osparat utkast ligger endast i den aktuella webbläsarens localStorage, kopplat till hushållskoden. Det följer inte med till andra enheter och försvinner om webbläsardata rensas. Ett utkast åt gången; användaren får välja innan ett annat ersätter det. Offline fungerar redigering av tillgängliga recept. Sparning väntar på nät och återförsöks med samma operations-id. Foto och länkimport kräver nät. Eget foto komprimeras och skickas till befintlig Drive-funktion; en övergiven bilduppladdning kan lämna en oanvänd Drive-fil.

## Gamla recept, matsedel och inköp

Befintliga Recept-, receptbank- och inspirationsdata läses fortsatt. Första ändringen fryser den gamla versionen så gamla matsedelsrader får samma innehåll. Om kalkylarket och receptbanken har olika innehåll under samma gamla id måste användaren välja vad redigeringen utgår från. Originalet skrivs inte över.

En receptsparning ändrar **inte** matsedel eller inköpslista. Efteråt kan användaren välja planerade måltider, granska en ny inköpsberäkning och godkänna. Köpta varor och egna tillägg bevaras. Om någon annan ändrar veckan/listan efter förhandsvisningen stoppas uppdateringen tills en ny granskning görs. Avbrutna serveroperationer återupptas via journalen. Favoriter, betyg, historik och veckolås använder stabil receptidentitet.

## Importens gränser

Länkimport tillåter HTTPS på ICA, Köket, Arla och Coop. Den försöker läsa publicerade Recipe-data i JSON-LD; den kör inte sidans JavaScript och kringgår inte inloggning eller blockering. Tillåten domän betyder **inte** att alla dess sidor fungerar. Tester använder kontrollerade exempel, inte löften om dessa sajters aktuella tillgänglighet. Om en sida saknar läsbara receptdata används inklistrad text eller manuell registrering. Oklara mängder och portioner behöver rättas. Inga externa foton kopieras automatiskt. Ingen OCR, video-, Instagram- eller betald AI-import ingår.

## Kontroller

- Serveremulator: kompatibilitet, idempotent setup, versionssparning, dubletter, validering, konflikt mellan enheter, avbrott/återförsök, arkivering, skydd mot ändrad inköpsförhandsvisning och kontrollerad JSON-LD-import/omdirigering.
- Webbläsare med låtsaskalkylark: skapa/redigera, söka, granska textimport, dubblettbekräftelse, behålla/återuppta/kasta utkast, foto, äldre kopior, offline, konflikt och kopia, explicit måltidsuppdatering, bevarade egna/köpta varor, arkivera/återställa och gammal server utan de nya flikarna.
- Telefon och väggstorlek, ljust/mörkt, UI 2 och UI 3; befintliga funktionstester för flikar, inställningar, personer, kalender, uppgifter, inköp och matlagning. CI jämför oförändrade UI 2-vyer mot main; receptvyerna har egna tester och bilder.
- Riktigt iPhone-tangentbord och Surface-kiosk behöver fortfarande kontrolleras på hårdvaran. Emulerade enheter ersätter inte den kontrollen.

## Efter Pusha, inte nu

1. Hämta aktuell main, kontrollera diff/CI och skapa ångra-gren enligt AGENTS.md.
2. Höj service worker-, app- och matvaror-versioner utifrån aktuell main; versionshöjningen är avsiktligt uppskjuten tills publicering godkänts.
3. Henrik klistrar från dator in hela [Kod.gs på arbetsgrenen](https://github.com/HenrikLH/hushallstavlan/blob/codex/recipe-management/apps-script/Kod.gs) i befintligt Apps Script-projekt. Kör `setupRecipes` (eller `setup`) en gång och distribuera en ny version med samma befintliga webbappsadress. Ändra inte hushållskod/adress.
4. Publicera klienten först när tillståndet omfattar det; verifiera Pages och prova ett recept mellan två riktiga enheter. Klienten fungerar med gammal server, men nya recept kan inte sparas förrän servern/flikarna är klara.

Publicera inte enbart för att planen, bilderna eller implementationen har godkänts. PR #20:s väderändring är separat.
