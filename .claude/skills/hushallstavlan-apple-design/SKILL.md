---
name: hushallstavlan-apple-design
description: Använd vid all ny eller ändrad design i Hushållstavlan (rutor, blad, listor, menyer, ikoner) och när Henrik säger att något ser hopsatt, "vibe codat" eller inte Apple-likt ut. Fasta mått för UI 5.0 och en granskningslista före skärmbilder.
---

# Apple-design i Hushållstavlan (UI 5.0)

Målet är att appen ska se ut som om Apple gjort den. Det som gör att något ser "vibe codat" ut är nästan alltid **egna mått per ruta**: en radie här, ett avstånd där, en extra färg, en egen ikonstil. Använd därför bara måtten nedan. Behövs ett nytt mått: lägg till det här först, sedan i CSS.

Reglerna bygger på Apples Human Interface Guidelines i sammanfattningen från [ehmo/platform-design-skills](https://github.com/ehmo/platform-design-skills) (MIT-licens, `skills/ios/SKILL.md`), översatta från SwiftUI till vår CSS. Läs originalet bara om en fråga inte besvaras här.

## 1. Fasta mått

CSS för UI 5.0 ligger under `html.ny.ui5` sist i `index.html` (variablerna står i `html.ny.ui5{…}`). Hitta dem med `grep -n 'html.ny.ui5{' index.html`.

**Text (Apples textskala, px = pt):**

| Roll | Storlek/radhöjd | Vikt | Används till |
|---|---|---|---|
| Stor rubrik | 34/41 | 700 | `.lt`, vyns titel |
| Rutrubrik | 20/26 | 700 | `.wh` i Översikt-rutor |
| Brödtext | 17/22 | 400 | listrader `.cell` |
| Underrubrik | 15/20 | 400–600 | namn i brickor, länkar i rubrik |
| Fotnot | 13/18 | 400–600 | status, `.sh` (versaler), `.foot`, scen-etiketter |
| Minsta | 11/13 | 500 | bara siffror i diagram, aldrig löptext |

Aldrig under 11 px. Hierarki med storlek och vikt, inte med fler färger. Inga egna storlekar som 14, 16, 18 eller 19 px.

**Avstånd:** 4-steg: 4, 8, 12, 16, 20, 24, 32. Rutor har `padding:16px`, mellan brickor `gap:8px`, mellan rubrik och innehåll 12px. Listinsats 16px (bladen) och 20px textindrag i `.cell`.

**Hörn (koncentriska, som i iOS 26):** inre radie = yttre radie − avståndet emellan.
- Ruta/kort/grupp: `var(--r5)` = 26px.
- Bricka inne i en ruta (16px kant): **16px**. Aldrig samma radie som rutan, aldrig kapsel på en bricka som är högre än 44px.
- Knappar med text (Klart, Inte nu), chips, segment, flikrad: kapsel (`999px`).
- Blad (sheet): 34px.

**Tryckytor:** minst 44×44 px på telefon och 48 på väggen. Brickor är minst 56px höga på telefon, 48px på väggen där fler måste få plats.

**Ikoner:** egna i SF Symbols-stil (inga riktiga SF Symbols, licens). Linje 1,5–2 px, rundade ändar, 24-rutnät. Storlek 17–20px i text och brickor, 22–24 i blad, 30 i flikraden på väggen. Ikonen får aldrig se tyngre ut än texten bredvid.

**Färg:**
- **En** interaktiv färg: vinröda `--accent` (inte Apple-blått). Länkar, valda segment, Klar.
- Bakgrundsnivåer: `--bg` (sida) → `--surface` (ruta) → `--fill` (bricka/knapp i rutan). Använd inte `--surface` för brickor inne i en ruta.
- Text: `--ink`, `--ink-2` (sekundär), `--ink-3` (platshållare). Inga egna gråtoner eller opacity på text.
- Systemfärger bara när de betyder något: `--red` ta bort/fel, `--green` klart, `--orange` varning, gult `#FFD60A` = lampa tänd. Kategorifärger (scener, personer, kost) bara i små ikonplattor eller punkter, aldrig som stora ytor.
- Kontrast minst 4,5:1 för text. Färg får aldrig vara enda signalen (lägg till text eller ikon).
- Varje egen färg ska ha ett mörkt läge. Kontrollera alltid båda.

**Rörelse:** fjädern `--ha-fj` för tryck/släpp, 0,2–0,3 s för färg. Animera bara `transform`/`opacity`. Respektera `MOTION` och reducerad rörelse.

## 2. Komponenter (återanvänd, bygg inte nya)

| Behov | Använd | Inte |
|---|---|---|
| Lista | `group()` + `.cell`, tunna linjer, rubrik `sh()` ovanför, fotnot `.foot` under | en ruta per rad |
| Rutrubrik | `.wh` med titel, grå tilläggstext i `<span class="wk-mo">`, länk `.r.lnk` med chevron | statusprickar, egna rubrikrader |
| Åtgärder för en ruta/lista | rund ⋯ (`details.create-menu` + `.create-options`) i rubriken | textpiller i innehållet ("··· Åtgärder") |
| Redigera/skapa | blad `sheetHtml()` med Avbryt vänster och Klar höger | dialoger, `alert` |
| Val av ett av få | `segc()` | rader av knappar |
| Av/på | iOS-brytare | kryssrutor |
| Ta bort i redigeringsläge | röd minus vänster, grepp ≡ höger | soptunna per rad |
| Kritisk fråga | blad med röd knapp | `confirm()` |

## 3. Granskningslista (kör före skärmbilder)

Gå igenom varje punkt och rätta innan bilderna visas för Henrik:

1. Alla textstorlekar finns i tabellen ovan.
2. Alla avstånd är 4, 8, 12, 16, 20, 24 eller 32.
3. Hörnen är koncentriska: inget inre element har samma radie som sitt kort.
4. Bara en accentfärg i interaktiva element; andra färger har en betydelse.
5. Inga namn klipps med "…" i normalfallet (testa längsta riktiga namnet). Klipps det: minska ikon/kant inom måtten innan texten krymps.
6. Rubriken följer grannrutornas mönster (jämför med Schema och Middag ikväll i samma skärmbild).
7. Ljust och mörkt läge ser lika genomtänkta ut.
8. Tryckytor ≥ 44px; väggen ≥ 48px och utan textfält.
9. Ny CSS ligger under rätt UI (`html.ny.ui5` eller rutans egen klass) och UI 2.0 ser oförändrat ut.
10. Jämför med motsvarande Apple-app (Hem, Påminnelser, Kalender, Väder, Inställningar) och skriv i svaret vilken du utgick från.

## 4. Tecken på "vibe codat" (undvik)

- Kapslar och jättehörn överallt, samma radie inne i och utanför ett kort.
- Många mättade färger samtidigt, färgade ytor i stället för små färgade ikoner.
- Tvåtonsytor och dekorativa gradienter utan betydelse.
- Statusprickar, badges och emojis som pynt.
- Egna storlekar (14, 16, 18 px) och avstånd (6, 10, 14 px) som bara gäller en ruta.
- Text i versaler, kursiv eller understruken utanför `.sh`.
- Skuggor på brickor inne i kort (Apple använder fyllnad, inte skugga, i kort).
- Ikoner från olika stilar eller med olika linjetjocklek.

## 5. Arbetsgång

1. Läs relevant del av den här filen och jämför med motsvarande Apple-app.
2. Bygg med befintliga komponenter (avsnitt 2) och mått (avsnitt 1).
3. Kör granskningslistan (avsnitt 3), rätta.
4. Ta skärmbilder enligt `hushallstavlan-forhandsvisa` (telefon, och väggen om den berörs, ljust och mörkt) och skriv kort vilka punkter som rättades.
