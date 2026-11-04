---
name: hushallstavlan-forhandsvisa
description: Använd för varje visuell ändring i Hushållstavlan innan den når main: emulatorns skärmbilder i telefon- och väggläge, A/B/C-alternativ och hur bilderna visas för Henrik.
---

# Förhandsvisa en visuell ändring

Henrik godkänner visuella ändringar på skärmbilder innan de når `main`. Han läser i telefonen och vill helst välja mellan alternativ (A/B/C) när flera designer är rimliga.

## Ta bilderna

1. Hitta rätt scenario i `verktyg/emu/` (t.ex. `vader-dag.js`, `matsedel-gester.js`, `hundbild.js`, `alla-flikar.js`). Finns inget: skriv ett eget, en modul `async (pg, h) => {}` (se `lib.js` och `alla-flikar.js`). Öppna flikar genom att klicka, inte via localStorage.
2. Telefon (390×844): `node verktyg/emu/run.js verktyg/emu/<scenario>.js`
3. Väggtavlan, om ändringen berör den: `LS='{"wall":"1","me":""}' VP=1368x912 node verktyg/emu/run.js verktyg/emu/<scenario>.js`
4. Mörkt läge bara om färger påverkas: `THEME=dark`. Andra variabler: `NOW` (låtsasdatum), `LS` (localStorage som JSON utan `ht.`), `SLOW` (ms per anrop), `VP`, `WXSYM`/`WXCF`/`WXMIX`/`WXYR` (väder).
5. Testa uppstart med berörda inställningar redan påslagna i `LS`, inte bara påslagna efter laddning.
6. Låt scenariot kontrollera med text (finns elementet, rätt text, inget PAGEERROR). Titta själv bara på de bilder som behövs för att bedöma utseendet. Bilderna hamnar i `verktyg/emu/shots/` (ignoreras av git).
7. Kan Chromium inte köras lokalt: `.github/workflows/emu.yml` i PR:en kör telefon/vägg × ljust/mörkt och sparar bilderna i sju dagar.

## Visa Henrik

- 1–2 bilder per ändring: telefon, och vägg om den berörs. Fler först när han ber om det. A/B/C: en bild per alternativ, märkt med bokstaven.
- I Claude-projekt: kopiera bilderna till `/mnt/project-files/<ämne>/` och bifoga dem i svaret (han kan inte öppna sökvägar som bara står i texten).
- Skriv kort på svenska vad som ändrats och vad han ska välja. Förslag committas på arbetsgrenen med "(förslag)" i meddelandet. Slå inte ihop till main förrän han skrivit "Pusha" (skill `hushallstavlan-publicera`).

## Utseende som ska bevaras

- UI 2.0 är standard. UI3-CSS bara under `html.ui3`, UI4 bara under `html.ui4`; de får inte ändra UI 2.0.
- Listor: ett kort med tunna skiljelinjer och grupprubriker som band.
- Väggskärmen har inget tangentbord: −/+ och reglage, inga textfält.
- Animationer: bara `transform`/`opacity` på HTML-element; inga nya SVG-filter eller rörliga delar i stilla SVG:er (mät med `verktyg/emu/lagg.js`, `vader-fps.js`).
