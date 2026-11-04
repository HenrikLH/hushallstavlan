---
name: hushallstavlan-ta-over
description: Använd i början av en ny Hushållstavlan-session eller när Henrik skriver "fortsätt": läs överlämningen och hitta rätt kod utan att läsa hela app.js.
---

# Ta över en uppgift i Hushållstavlan

Målet är att kunna fortsätta utan ny debriefing och med så lite inläsning som möjligt. Repot är gemensamt minne för Claude och Codex.

## Start

1. `git fetch origin main` och läs `OVERLAMNING.md` på `origin/main`. Finns en arbetsgren för uppgiften: läs även dess `OVERLAMNING.md` och `git log origin/main..<gren> --oneline`.
2. Kolla öppna PR:er som berör samma område. Commits med `Agent: Codex` kommer från Codex.
3. Ägarskap: en agent per uppgift och gren. Ta över en sparad gren bara om Henrik bett dig fortsätta eller arbetet är markerat som pausat; uppdatera ägaren i överlämningen.

## Hitta koden

- Läs aldrig hela `app.js` (≈530 kB), `index.html` eller `Kod.gs`.
- `node verktyg/karta.js` ger avsnitt med radintervall; `node verktyg/karta.js <namn>` visar var en funktion, `V.x` eller `ACT.x` definieras, `-r` även var den används. Läs sedan bara det intervallet med offset/limit.
- Henrik pekar ut rutor med nummer som `M2`: `node verktyg/rutor.js M2`. Ny ruta: nästa lediga (`node verktyg/rutor.js M`), namnet i `verktyg/rutor.json`; borttagna nummer återanvänds aldrig.
- CSS: grep efter klassnamnet i `index.html`.
- Läs inte samma intervall igen i samma session; se ändringar med `git diff`/`git log -p -- <fil>`.

## Arbeta

- Skriv i app.js:s kompakta stil och formatera aldrig om filen.
- Utgå från grundorsaken i kod och faktiskt beteende; skilj verifierat från antaget.
- Före paus eller agentbyte: committa, pusha arbetsgrenen, öppna/uppdatera PR (utkast om ofärdig) och skriv 5–8 rader i `OVERLAMNING.md`: mål, ägare + gren/PR, nästa steg, viktiga beslut/hinder, teststatus + testad commit.
