# Hushållstavlan – instruktioner för AI-agenter

Gemensam grund för Codex och Claude Code (via `CLAUDE.md`). Läs hela filen och `OVERLAMNING.md` när du tar över eller börjar en ny session. I samma session räcker det att läsa det som ändrats. Arbetsrutinen står i avsnitt 7.

Om något här säger emot det Henrik skriver till dig gäller Henriks ord. Uppdatera då filen i samma ändring så att nästa agent vet.

---

## 1. Vad appen är och vem den är till för

Hushållstavlan är hushållets gemensamma app för två personer som bor ihop i Värnamo:

- **Henrik** äter kött. Han äger repot, beställer all utveckling och testar i telefonen.
- **Cornelia** är vegetarian (lakto-ovo, men äter inte ägg).
- **Gemensam skärm**: en väggskärm i köket (Surface Pro 5 med Linux Mint 22.3, Chromium i kioskläge, ingen tangentbord, pekskärm). På väggen visas en egen tavla med flera rutor samtidigt.

Appen ska göra vardagen lugnare: se dagens schema och väder, planera veckans mat inom budget så att allt som lagas blir uppätet, handla rätt saker, dela upp hushållssysslor, hålla koll på ekonomi och stående överföringar, och påminna om födelsedagar.

Delar (flikar längst ner): **Mat** (Vecka, Inköp, Recept med undersidorna Inspiration/Mina recept/Efterrätter, Receptbank), **Ekonomi**, **Översikt**, **Uppgifter** (med kalender), **Städ**. Dessutom Väder-vy, Födelsedagsvy, Inställningar, matlagningsläge och väggtavlan.

All text som användaren ser är på **svenska**, vardaglig och kort. Commit-meddelanden skrivs också på svenska (se git-loggen för tonen).

## 2. Hur Henrik arbetar (viktigt)

- Henrik skriver på svenska och använder nästan bara **telefonen**. Svara på svenska, kort, med resultatet först.
- **Visuella ändringar visas först.** Gör förslag med skärmbilder (telefon, och väggskärm om det berör den) och vänta på hans ok innan det når `main`. När han skriver "Pusha" betyder det: slå ihop till `main` så att det publiceras.
- **Ångra-punkt före varje push till main.** Spara nuvarande `main` som en gren `version-fore-<kort-namn>` innan du slår ihop. Taggar går inte att pusha från molnmiljöer, därför grenar. Kan du inte skapa grenar: skriv commit-hashen för `main` före din ändring i `OVERLAMNING.md`.
- **Listor**: en yta (ett kort) med tunna skiljelinjer mellan raderna och grupprubriker som band, inte en separat ruta per grupp.
- Han vill helst kunna välja mellan alternativ (A/B/C) när det finns flera rimliga designer.
- Apps Script (`Kod.gs`) kan han bara klistra in från en **dator**, inte från telefonen. Se avsnitt 5.

## 3. Arkitektur

```
Telefon / väggskärm (PWA)  ──GET/POST──▶  Google Apps Script-webbapp (apps-script/Kod.gs)  ──▶  Google-kalkylark
        │                                         │
        └── api.met.no, Open-Meteo (väder)        └── Google Kalender (synk var 15:e min), Drive (matbilder), Willys-priser
```

- **Ingen byggprocess.** Statiska filer i repots rot publiceras med **GitHub Pages från `main`** på https://henriklh.github.io/hushallstavlan/. Allt som hamnar på `main` är i drift inom någon minut.
- `index.html` (≈140 kB): all HTML-stomme och **all CSS** i en `<style>`. Ny design ("UI 2.0", standard) är CSS under `html.ny`. Gamla UI 1.0 finns bara i utvecklarläget och ska inte gå sönder, UI 3.0 utvecklas som separat frivilligt val; UI 2.0 ska behålla sitt utseende och beteende tills Henrik säger annat.
- `app.js` (≈470 kB): hela appen i en fil. Kompakt stil med långa rader och korta namn. **Skriv i samma stil och formatera aldrig om filen** (ingen Prettier/ESLint --fix): omformatering ger enorma diffar och krockar med andra agenters arbete.
  - `S` = tillstånd, `A` = appens objekt, `V` = vyer (`V.mat`, `V.oversikt` …), `ACT` = alla handlingar. Klick hanteras via `data-act="namn"` och `data-id`, `data-hold` för håll-in-knappar (1 s). Vyer returnerar HTML-strängar; `render()`/`doRender()` ritar om.
  - `apiGet()` hämtar allt, `setData()` tar emot det. `apiPost(body)` lägger ändringen i **utkorgen** `OUTBOX` (sparas i localStorage `ht.outbox`), `flush()` skickar en i taget och försöker igen vid nätfel och låsfel. Appen visar ändringen direkt (optimistiskt).
  - Inställningar **per enhet** ligger i localStorage med prefix `ht.` (`lsGet`/`lsSet`). Inställningar för **hela hushållet** ligger i kalkylarkets flik Inställningar.
  - Personer: `personer` lagras som `stabilNyckel:färg[:URL-kodatVisningsnamn]` per person. `people()` ger stabila nycklar för data/API; `personLabel()` ger namnet som ska visas. Byt aldrig datanyckel vid namnbyte: uppgifter, kalender, betyg och ekonomi ska behålla ägare. Äldre `namn:färg` fungerar oförändrat. Inställningarnas Personer samlar användarval, namn och färg; ändringar av namn/färg sparas med Spara. Kategorierna byggs uttryckligen i `settingsGroups`, inte från rubrikmatchning.
  - `U3` = UI 3.0, frivilligt val under Inställningar → Utvecklarläge → Design (`ht.ui=3`, kräver `ht.dev=1`), annars UI 2.0. UI 3.0 ärver basen under `html.ny`, men alla dess CSS-ändringar ska ligga under `html.ui3` och beteendeändringar skyddas med `U3`. UI 2.0:s utseende, funktioner och sparade preferenser ska bevaras. Rutornas ordning sparas separat i `ovLayout3`/`wallLayout3`.
  - `NY` = UI 2.0-basen på, `DEV` = utvecklarläge (brytare längst ner i Inställningar), `wallBoardOn()` = väggtavla.
  - En skärm som alltid står på laddar om sig själv när `app.js?v=` i `index.html` har ändrats (kollas var tionde minut, bara när ingen gör något).
- Andra filer: `matvaror.js` (basvaror, förpackningar, priser, kategorier), `matpoang.js`, `restpoang.js` (poäng för veckoförslag och rester), `kottveg.js` (rätter med kött- och vegvariant), `willys-sok.js`, `inspiration.json` (≈100 inspirationsrecept), `sw.js` (service worker), `config.js` (Apps Script-adressen), `bilder/`, `icons/`, `widget.html`/`widget.txt` (hemskärmswidget), `kiosk/` (installationsskript och ljussensortjänst för väggdatorn).
- **Apps Script** (`apps-script/Kod.gs`): `doGet` ger all data (`settings, shop, tasks, clean, menu, events, offers, recipes`), `doPost` tar `{action, key, by, …}`. Flikar och kolumner står i `TABS` och `COLS` högst upp. Hushållskoden (`key`) kontrolleras i `checkKey_`.
- **Inställningar som appen får skriva** måste stå i `SETTING_KEYS_WRITABLE` (eller vara `receptbank_N`). En ny nyckel ger annars felet "Inställningen kan inte ändras från appen" tills Henrik klistrat in ny `Kod.gs`. Återanvänd hellre en befintlig nyckel (till exempel lagras efterrätt och lås i `onskelista`).

## 4. Versioner och publicering (gör så här varje gång)

Varje ändring som ska ut till användarna:

1. Jobba på en egen gren, aldrig direkt på `main`.
2. Precis innan du höjer versionen: `git fetch origin main && git merge origin/main` (andra agenter pushar ofta, ibland flera gånger i timmen).
3. Höj versionen, alltid **ett steg över det som nu finns på main**:
   - `sw.js`: `const VERSION = 'ht-vNNN'`
   - `index.html` **och** `sw.js` (listan `SHELL`): `app.js?v=NNN`. Höj den även om bara CSS i `index.html` ändrats, annars laddar väggskärmen inte om.
   - Har du ändrat `matvaror.js`, `kottveg.js`, `matpoang.js`, `restpoang.js` eller `config.js`: höj deras `?v=` på samma två ställen.
4. Skriv versionen i commit-meddelandet, till exempel `Inköp: håll in för att tömma (ht-v170)`.
5. Skapa ångra-grenen `version-fore-<namn>` från nuvarande `main`, slå ihop, pusha.
6. Kontrollera att GitHub Actions-jobbet "pages build and deployment" faktiskt körde och blev grönt. Det har hänt att en push aldrig byggdes.
7. Uppdatera aktuell status i `OVERLAMNING.md` och ta bort lösta punkter (se avsnitt 7). Dokumentation/testverktyg kräver ingen appversionshöjning.

Krockar i `sw.js`/`index.html` vid sammanslagning: ta det högsta numret från båda sidor och lägg på ett.

## 5. Apps Script (Kod.gs)

- `apps-script/Kod.gs` i repot är **originalet**. Henrik klistrar in den i Apps Script-redigeraren från en dator, kör `setup` vid behov och publicerar en ny version under Distribuera → Hantera distributioner. Ge honom länken till filen på GitHub, inte en kopia någon annanstans.
- **Appen måste fungera med den gamla Kod.gs** tills Henrik har klistrat in den nya. Bygg så att klienten klarar sig (eller tyst väntar) om servern inte känner till en ny åtgärd eller nyckel.
- Varje Kod.gs-ändring läggs in under "Väntar på Henrik" i `OVERLAMNING.md` och tas bort först när han bekräftat att den är inklistrad och publicerad.
- Sheets vägrar ta bort sista raden under den frysta rubriken. Ta bort rader med `delRow_` (lägger till tomma rader först). Klienten lägger dessutom en dold rad "(rad för appen, ta inte bort)" (`PLATS`) i Inköp.
- Rör inte hushållskoden, `HOUSEHOLD_KEY` eller adressen i `config.js` utan att Henrik bett om det.

## 6. Testa innan push

Det finns ingen testsvit, men det finns en emulator som kör den riktiga `Kod.gs` i Node med ett låtsaskalkylark och styr appen i Playwright:

```
node verktyg/emu/run.js verktyg/emu/alla-flikar.js                 # telefon, alla flikar och undersidor
LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/alla-flikar.js  # väggtavlan, gemensam skärm
```

Playwright installeras med `npm install --no-save playwright && npx playwright install --with-deps chromium` om den saknas.

Om Chromium inte kan installeras lokalt: använd `.github/workflows/emu.yml` i PR:en. Den installerar webbläsaren och kör telefon/vägg × ljust/mörkt; bilder sparas i sju dagar. Kontrollera jobbresultaten. Rena dokumentations-PR:er hoppar över röktestet.

Skärmbilder hamnar i `verktyg/emu/shots/` (ignoreras av git). Röktestet klickar på riktiga knappar och skriptet avslutas med kod 1 om sidan kraschar, en knapp saknas eller scenariot kastar fel (`SCENARIO FAIL`). Egna scenarier är en modul `async (pg, h) => {}`; se `lib.js` och `alla-flikar.js`. Miljövariabler: `NOW` (låtsasdatum), `THEME` (`light`/`dark`), `LS` (localStorage som JSON utan `ht.`-prefix), `SLOW` (ms fördröjning per anrop), `CHROMIUM` (sökväg till webbläsare), `VP` (fönsterstorlek, till exempel `1368x912`; utan den används telefon 390×844). Väder från api.met.no fejkas; `data.js` är en ögonblicksbild av arket från 2026-10-18.

Före publicering av appändringar (lokalt eller i CI):

- Kör `alla-flikar.js` i både telefon- och väggläge utan PAGEERROR.
- **Öppna varje flik genom att klicka**, inte genom att sätta localStorage. Appen minns senaste fliken, så en krasch i en flik kan låsa hela Mat-delen.
- Testa uppstart med de berörda inställningarna **redan påslagna** i localStorage, inte bara när de slås på efter laddning (en sådan bugg gav grå väggskärm).
- Ta skärmbilder i ljust och mörkt läge för visuella ändringar.
- Återanvänd godkända resultat för samma app- och testkod; ange testad commit/CI-länk. Kör om när relevant kod, testmiljö eller testfall ändrats, eller ett fel är olöst. Rena dokumentationsändringar behöver bara diff- och innehållskontroll.

## 7. Samarbete mellan agenter

Claude och Codex ser inte varandras samtal. **Repot är gemensamt minne.** Henrik ska kunna byta agent och skriva "fortsätt" utan att återberätta arbetet.

- **Vid övertagande:** hämta senaste main och läs grunden ovan, aktuell överlämning och relevanta öppna PR:er. Läs även överlämningen på den aktuella arbetsgrenen; main kan sakna pågående arbete. Läs commit-historik/diff och berörda funktioner vid behov, inte rutinmässigt 20 commits eller hela app.js. Redan inläst, oförändrat material behöver inte läsas igen.
- **Ägarskap:** en agent per uppgift. Parallellt arbete ska beröra skilda funktioner/CSS-block. Vid Henriks begäran att fortsätta, eller tydligt pausmarkerat arbete, ta över den sparade grenen i egen checkout och uppdatera ägare. Behövs en ny gren: utgå från sparad commit och länka tidigare PR. Skriv aldrig samtidigt i samma arbetsgren. Fråga bara om flera uppgifter är lika rimliga eller ägarskapet är oklart.
- **Före paus/agentbyte:** committa, pusha arbetsgrenen och öppna/uppdatera PR (utkast om ofärdig). Spara högst 5–8 rader per uppgift i `OVERLAMNING.md`: mål; ägare + gren/PR; berört område + nästa steg; viktiga beslut/hinder som inte framgår av koden; teststatus + testad commit/CI-länk. Vid skrivhinder: säg tydligt att arbetet ännu inte är tillgängligt för nästa agent.
- **Håll minnet litet:** `AGENTS.md` innehåller bestående regler och arkitektur; `OVERLAMNING.md` bara aktuell status (sikta på högst 50 rader). Ersätt gamla punkter och ta bort avslutade uppgifter. Ingen växande logg, separat debriefing eller kopierad chatthistorik; git/PR/CI innehåller detaljerna. Spara bara sådant nästa agent behöver för att fortsätta rätt. Läs varandras kod när det löser en konkret oklarhet.
- **Färdigt/publicering:** uppdatera överlämningen i samma PR, behåll olösta punkter som kräver Henrik och ta bort lösta. Codex lämnar PR mot main och slår ihop först efter Henriks godkännande ("Pusha"); agentbyte är inget publiceringstillstånd. Skriv `Agent: Codex` eller `Agent: Claude` sist i commit-meddelandet.
- **Åtkomst:** git-push och GitHub-integrationen har separat autentisering. Integrationens Git-objektverktyg kan publicera till egen gren om git-push saknar inloggning; verifiera fjärrdiffen. Lägg aldrig tokens i repot.

## 8. Kända fallgropar

- Skicka aldrig en funktion med flera parametrar direkt till `.map` (`meals.map(mealCell)` gav index som andra argument och kraschade kalendern).
- Klick på växlingsknappar har `preventDefault`, så varje `ACT` för en brytare måste själv anropa `render()`.
- `const A` och liknande nås inte innan de är skapade (TDZ). Kod som körs vid uppstart får inte läsa dem för tidigt.
- Väggskärmen har inget tangentbord: använd −/+ och reglage, inte textfält.
- iPhone: menyraden "följde med" vid scroll efter tangentbord; `vvFix` i app.js flyttar fasta element med `visualViewport`. Går inte att återskapa i Chromium, be Henrik testa.
- Instagram och vissa sidor är blockerade från molnmiljöer. Be Henrik om skärmbilder av recept.
- Apps Script svarar långsamt (sekunder per anrop). Batcha eller visa ändringen direkt och skicka i bakgrunden.
- Ändringar i `inspiration.json`: recept har `id`, `title`, `group`, `who`, `portions`, `min`, `kr`, `protein`, `course` (`'efterrätt'` för efterrätter), `groups` (ingredienser) och `steps`.
- Väggdatorns ljussensor och skärmljus går via en lokal tjänst (`kiosk/ljussensor.py`, http://127.0.0.1:8777). Den kan inte testas i molnet.

## 9. Vad du inte ska göra

- Pusha inte direkt till `main` utan ångra-gren och versionshöjning.
- Ändra inte i Henriks Google-kalkylark, kalender eller e-post utan att han bett om det.
- Lägg aldrig in lösenord, hushållskod eller andra hemligheter i repot.
- Byt inte ramverk, lägg inte till byggsteg eller beroenden i appen, dela inte upp `app.js` i moduler utan att Henrik bett om det.
