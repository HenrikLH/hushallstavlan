# Designriktlinjer: Skog (tidigare Tavla 3, "Skog och sjö")

Underlag: Henriks bild 14/11 2026 (väggtavla + telefon). Byggt som Tavla 3 (Utvecklarläge → Ny översikt → Tavla 3, `ovny=h`). Gäller allt som byggs i den nya stilen, och är grunden när stilen förs över till resten av appen.

## 1. Känsla

Lugn, nordisk och varm. Ett dimmigt sjölandskap i bakgrunden, frostade ljusa kort ovanpå, skogsgrönt som enda accent. Inget skriker: färg används bara för att visa status (tänt, klart, varning), aldrig för att dekorera.

## 2. Färger

Färgerna är uppmätta i bilden och avrundade till ett fast schema. I koden ligger de som variabler på `.ot` (index.html, blocket "Tavla 3").

### Ljust läge

| Roll | Variabel | Färg | Används till |
|---|---|---|---|
| Text | `--ot-ink` | `#1F2723` | Rubriker, tider, titlar |
| Text, dämpad | `--ot-i2` | `#69706B` | Datum, underrader, "– kommande 3 dagar", status |
| Kort (glas) | `--ot-glas` | `rgba(248,246,241,.86)` + oskärpa 24 px | Alla stora kort |
| Ruta i kort | `--ot-ruta` | `rgba(255,255,255,.66)` | Dagkolumner, Smart hem-rutor, scenknappar |
| Kortkant | `--ot-kb` | `rgba(255,255,255,.7)` | 1 px kant runt kort och rutor |
| Dagband | `--ot-band` | `#EFEBE3` | Rubrikband för Imorgon och dagen efter, segmentväljarens botten |
| Idag | `--ot-idag` | `#E4E8D8` | Rubrikbandet för Idag, vald dag i segmentväljaren |
| Linje | `--ot-linje` | `rgba(31,39,35,.12)` | Tidslinjens streck, tom förloppsstapel |
| Skogsgrön (accent) | `--ot-gron` | `#6E9A5A` | Idags prickar, bockade rutor, förlopp, påslagen brytare |
| Mörk grön | `--ot-gron2` | `#2F5D3A` | Text/ikon på grön yta |
| Ljusgrön | `--ot-gronl` | `#D5E3CB` | Vald scen (ikonen och texten mörkgröna) |
| Appens accent | `--accent` | `#4A7C46` (mörkt `#A6CF92`) | Skog: standard i hela appen sedan 14/11 (flikraden, knappar, länkar). Vinröd finns kvar som val under Färgval |
| Bärnsten | `--ot-amb` | `#E39A1E` | Tänd lampa, aktiv apparat, födelsedag |
| Varning | `--ot-ora` | `#F26B3A` | Utropstecknet för regn och väderlarm |
| Väderkort | `--ot-wx` | `rgba(40,52,48,.6)` + oskärpa 20 px | Mörkt glas, vit text |
| Sidomeny | – | `#2C3C38` | Väggens meny; vald flik `rgba(255,255,255,.16)` |
| Sida | – | `#ECE7DE` | Bakgrund under landskapet |
| Neutral prick | – | `#A5A9A4` | Prickar för kommande dagar |

### Mörkt läge

Samma roller, nattskog: text `#EDF1EC`, dämpad `#A2AAA4`, kort `rgba(27,34,31,.84)`, ruta `rgba(255,255,255,.06)`, grön `#8DBB77`, ljusgrön `rgba(141,187,119,.24)`, sida `#121715`. Landskapet byter till nattfärger. Bärnsten och varningsorange är oförändrade.

### Landskapet

Ritas med SVG (`otLand()`), inget foto. Himmel `--s1 → --s2 → --s3`, sol/dis `--sol`, sjö `--sj → --sj2`, skog i tre lager `--l1` (bortre, dimmig), `--l2`, `--l3` (närmast). Fyra lägen efter solens höjd (`otFas()`): dag, gryning, kväll, natt. På väggen ligger landskapet bakom hela tavlan och tonar ut nedåt. På telefonen syns det bara bakom klockan.

### Regler för färg

- Grönt betyder "klart, på eller idag". Inga andra accentfärger i korten.
- Scenernas ikoner är neutrala (textfärg), den valda scenen ljusgrön. Inga egna färger per scen.
- Bärnsten betyder "något är igång" (lampa, maskin). Orange bara för varningar.
- Dagarna i Schema skiljs åt med band, inte färger. Idag är salviagrönt, övriga dagar neutrala.
- Personfärger visas inte i korten. Vem det gäller syns när man håller över eller öppnar händelsen.

## 3. Typografi

Systemtypsnittet (SF Pro / Inter-liknande), siffror med `num` (tabellsiffror).

| Element | Vägg | Telefon |
|---|---|---|
| Klocka | 104 px, vikt 600, tätt spärrad | 48 px, 600 |
| Appnamn | 36 px, 700 | 20 px, 700 |
| Datum bredvid klockan | 30 px, 500 | 15 px, dämpad |
| Kortrubrik | 24 px, 700 | 19 px, 700 |
| Rubrikens tillägg | 18 px, 500, dämpad | 14 px |
| Dagrubrik | 22 px, 700 + datum 16 px dämpad | segmentväljare 14 px |
| Rad (tid + titel) | 16 px, tid 600 | 15 px |
| Ruta i Smart hem | namn 19 px 600, status 16 px dämpad | etikett 12 px |

## 4. Former och mått

- Kort: hörn 24 px (telefon 20), luft 18 × 20 px (telefon 14 × 16), mellanrum 16 px (telefon 12), mjuk skugga.
- Rutor i kort: hörn 18 px, 1 px ljus kant.
- Knappar som piller (scener, väljare): helt rundade, höjd 48 px på väggen.
- Bockrutor: 24 px, hörn 6, fylls gröna med vit bock när klara; klar rad blir genomstruken och dämpad.
- Ikoner: linjeikoner 1,8–1,9 i streck, 28–34 px i rubriker på väggen.
- Minsta tryckyta 44 px. Väggen har inget tangentbord: bara tryck, −/+ och reglage.

## 5. Komponenter

1. **Toppen (vägg):** husikon + Hushållstavlan + hälsning/namnsdag, under det klockan, ett tunt vitt streck, datum och vecka. Vit text med svag skugga direkt på landskapet, inget kort.
2. **Väderkortet:** mörkt glas uppe till höger. Ikon, temperatur, varning (orange utropstecken + rubrik + råd) och sju timmar. Utan varning visas väderläget och H/L.
3. **Schema:** tre dagkolumner med rubrikband, tid och titel per rad, prick och tunn linje. Passerade händelser döljs. Max fem rader per dag, sedan "+N till". Telefonen visar en dag i taget med väljaren Idag / Imorgon / dag.
4. **Smart hem:** "N enheter aktiva" i rubriken. En ruta per rum (ikon, namn, status), inga brytare på rutorna (en brytare skulle släcka allt i rummet). Trycket på ett rum zoomar ut rutan till en större vy med rummets lampor och reglage (dra i sidled för ljusstyrka), tryck utanför så krymper den tillbaka. Enheter flyttas mellan rum under "Ändra enheter i rummet". Scener som piller under. Telefonen visar rummen som ikonknappar.
5. **Att göra** och **Städ:** två kort på väggen; Städ har "N av M klara" med grön stapel. Telefonen har ett kort med en glidande växlare Att göra / Städ.
6. **Sidomenyn (vägg):** skogsgrön, ikon med namn under, vald flik ljusare.

## 6. Väggens rutnät

```
"topp  topp  väder"
"schema schema smart"
"göra  städ  smart"
```

Tre lika breda kolumner, rader 200 px / 1 / 1. Väderkortet sträcker sig 160 px in över mittkolumnen.

## 7. Att föra över stilen till resten av appen

Ordning: 1) flytta variablerna från `.ot` till hela appen bakom samma val, 2) Översikt, 3) Kalender och Att göra, 4) Mat, Städ och Hemmet, 5) sidomenyn och flikraden i grönt. Varje steg visas med bilder i ljust och mörkt innan det publiceras. Befintliga mått i `hushallstavlan-apple-design` gäller där den här filen inte säger något annat.

## 8. Granska före bilder

- Bara grönt, bärnsten och orange som färger. Inga dagfärger.
- Text på landskapet är vit och läsbar i alla fyra lägen.
- Inga avklippta titlar: långa ord bryts med bindestreck, högst två rader.
- Allt ser rätt ut i mörkt läge.
- Tomma lägen har en kort rad ("Inget inplanerat", "Ingen middag planerad").
