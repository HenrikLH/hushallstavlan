# Förslag: hitta och välja recept

Status: UX-förslag före ombyggnad. Produktionsfilerna app.js, index.html och Kod.gs ändras inte. Prototypen använder appens befintliga CSS och ikoner, med tydligt avgränsade exempelrecept i minnet. Den får aldrig laddas av produktionsappen.

## Verifierade grundorsaker på main ht-v174

- `recipeTools()` blandar Nytt recept/Importera (handlingar), Favoriter/Högst 30 min (filter) och Arkiverade (navigering) i `.pill`. Inköp använder `.sh-tools`, `.sh-btn` och `.sh-ic` för handlingar samt `.fchips` för filter.
- `RFILT` blandar mattyp med Snabbt/Storkok. Snabbt och `RC.max` gör samma 30-minutersurval, men som mattyp kan Snabbt inte kombineras med Vegetariskt. Två oberoende filterrader och tillstånd döljer detta för användaren.
- `RC.q/fav/max` delas mellan underflikarna; `S.inspoFilter` och `S.bankFilter` är separata. `clear` nollställer bara RC-värdena. Sökningen följer därför med till nästa flik, och Rensa kan lämna ett matfilter aktivt. Diagnosskriptet bekräftar båda beteendena med riktiga klick.
- `matRecipes()` räknar hela inspirationsutbudet före sök/filter. Mina recept delar träffarna i favoriter/sparade även när första gruppen är tom. Efterrätter har ytterligare en sammanställning. Tomlägen hänvisar delvis till äldre `S.u3Query` trots att sökningen nu använder `RC.q`.
- Arkiverade öppnar `RC.screen='archived'`; `RC.archived` används bara för knappens aria-pressed och blir aldrig valt. Knappens utseende och semantik beskriver alltså inte dess funktion.
- `.rc-tools`/`.rc-toolbar` saknar samma sidmarginal som sök/filter i övriga Mat-vyn. Därför börjar vissa knappar vid skärmkanten, vilket syns i Henriks bilder.

## Rekommenderad lösning

1. Behåll Recept → Inspiration/Mina recept/Efterrätter. Direkt under dem: Nytt recept och Importera i samma neutrala komponent och avstånd som Inköps åtgärder. Vanligt klick, ingen håll-in-funktion. Behåll utkastlänken som en egen rad när ett utkast finns.
2. Sökfält med nuvarande förstoringsglas. Samma sökning gäller titel och ingrediens. Under fältet: ett gemensamt filterområde med mattyp som ett val och Favoriter/Högst 30 min/Storkok som oberoende tillval. Ta bort dubbleringen Snabbt. Efterrätter visar relevanta Favoriter/tid, utan mattyp eller Storkok.
3. Visa valda kapslar, antal aktiva sök-/filterval och Rensa allt. Rensa återställer både sökning och samtliga filter på den aktuella underfliken. Varje underflik minns sina egna val; inga dolda filter följer till en annan underflik.
4. Visa antalet faktiska träffar från samma urval som korten. Mina recept blir en samlad lista, favoriter först; hjärtan visar vilka de är. Inga tomma favoritgrupper överst. Återanvänd befintliga kompakta receptkort konsekvent i alla tre underflikar.
5. Visa arkiverade är en tydlig navigeringslänk i Mina recepts filterområde. Behåll den befintliga arkivsidan/återställningen. Tillbaka återger Mina recepts tidigare sökning/filter; arkivering påverkar aldrig planerade receptversioner.
6. Ett tomläge: Inga recept matchar dina val, med synlig återställning. Skilj en tom receptbank från ett filtrerat tomt resultat. Behåll laddnings-/nätfel som egna tillstånd.
7. Visa veckodatum under Vecka/Inköp där det behövs; receptbiblioteket är oberoende av veckan. Det frigör utrymme för faktiska recept på telefonen.

## Gräns och nästa implementation

- Endast prototypens filter/sök/favorit/sparat/arkivdata är nya här. Prototypen visar att de föreslagna interaktionerna fungerar; den är inte ett nytt lagrings- eller synklager.
- Efter godkänd design: bygg en gemensam urvals-/renderingsmodell över befintliga datakällor och stabila receptidentiteter. Återanvänd nuvarande editor, import, utkastlänk, favorit-/bankändringar, arkiv/återställning och konflikthantering. Behåll kortens befintliga öppna/laga/veckoplaneringsfunktioner.
- Uppdatera aldrig matsedel/inköp som följd av filter eller biblioteksändring. Produktionsflödena för granskning och uttrycklig uppdatering behålls. Ingen Kod.gs-ändring bedöms behövas.
- Testa då även omstart, synk/konflikt/offlineutkast, arkiverade efterrätter och faktiska datakällor. Det får inte beskrivas som verifierat av prototypens minnesdata.

## Verifiering

`verktyg/emu/recept-forslag.js` kör diagnos mot riktig app i emulerad miljö och därefter prototypen `verktyg/ux/recept-forslag.js`. Alla klick/sökningar går via riktiga UI-kontroller. Kontrollerar tre underflikar, kombinerade mattyp/favorit/tid/storkok, ingredienssökning med ikon/Enter, träffantal/tomläge/Rensa allt, separata filterminnen, arkiv/återställning och favorit/sparat i exempeldata. Nytt recept/Importera öppnar befintliga flöden med klick. Emulerade Matsedel, Inköp och Inställningar måste vara exakt oförändrade.

Verifierat i [CI 39800233326](https://github.com/HenrikLH/hushallstavlan/actions/runs/39800233326), kod/test-commit `a803d32`: fyra gröna lägen, telefon/vägg × ljust/mörkt. Inga PAGEERROR eller scenariofel. Endast underlag, bilder och överlämning ändrades efter detta.

## Skärmbilder från den testade prototypen

- [Telefon, mörkt](../outputs/recept-filter-forslag/telefon-dark.png) · [Telefon, ljust](../outputs/recept-filter-forslag/telefon-light.png)
- [Vägg, mörkt](../outputs/recept-filter-forslag/vagg-dark.png) · [Vägg, ljust](../outputs/recept-filter-forslag/vagg-light.png)
- [Kombinerade filter](../outputs/recept-filter-forslag/filter.png) · [Tomt resultat](../outputs/recept-filter-forslag/tomt.png)
- [Inspiration](../outputs/recept-filter-forslag/inspiration.png) · [Efterrätter](../outputs/recept-filter-forslag/efterratter.png) · [Arkiv](../outputs/recept-filter-forslag/arkiv.png)
