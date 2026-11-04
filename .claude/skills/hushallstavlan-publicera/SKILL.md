---
name: hushallstavlan-publicera
description: Använd när Henrik skriver "Pusha" i Hushållstavlan-repot, eller när en ändring annars ska ut på main: versionshöjning, ångra-gren, sammanslagning, Pages-kontroll och överlämning.
---

# Publicera Hushållstavlan ("Pusha")

"Pusha" = Henriks godkännande att slå ihop arbetsgrenen till `main`, som GitHub Pages publicerar inom någon minut. Det gäller det han just godkänt; fråga inte igen. Codex lämnar PR och slår ihop först efter "Pusha".

## Steg

1. Stå på arbetsgrenen (aldrig `main`) med allt committat.
2. Kör `node verktyg/version.js`. Det hämtar och slår ihop `origin/main`, löser krockar som bara gäller versionsnummer och höjer allt ett steg över main:
   - `sw.js`: `const VERSION = 'ht-vNNN'`
   - `index.html` **och** `sw.js` (listan `SHELL`): `app.js?v=NNN`, även om bara CSS i `index.html` ändrats (annars laddar väggskärmen inte om).
   - Ändrade `matvaror.js`, `kottveg.js`, `matpoang.js`, `restpoang.js` eller `config.js`: deras `?v=` på samma två ställen.
   Stannar skriptet på en riktig krock: lös den, `git add`, kör `node verktyg/version.js --utan-merge`. Går skriptet inte alls: `git fetch origin main && git merge origin/main` och höj för hand. Vid versionskrock: högsta numret från båda sidor plus ett.
3. Röktest om appkoden ändrats sedan senaste godkända körning (se AGENTS.md avsnitt 6): `alla-flikar.js` i telefon- och väggläge utan PAGEERROR/SCENARIO FAIL. Ange testad commit eller CI-länk. Rena dokumentationsändringar behöver ingen versionshöjning eller röktest.
4. Ångra-gren: skapa `version-fore-<kort-namn>` från nuvarande `main` (git push eller GitHub-integrationens `create_branch`; taggar går inte att pusha). Går det inte: skriv mains commit-hash i `OVERLAMNING.md`.
5. Uppdatera `OVERLAMNING.md` i samma ändring: kort status (publicerad, version, ångra-gren, test), ta bort lösta punkter, högst ≈50 rader totalt. Kod.gs-ändring: lägg den under "Väntar på Henrik" med länk till `apps-script/Kod.gs` på GitHub.
6. Commit på svenska med versionen, t.ex. `Inköp: håll in för att tömma (ht-v170)`, sist `Agent: Claude` (eller `Agent: Codex`).
7. Slå ihop till `main` och pusha. Har main hunnit ändras: kör version.js igen.
8. Kontrollera att GitHub Actions-jobbet "pages build and deployment" körde för merge-commiten och blev grönt. Startade det inte: kör om jobbet om du kan, annars säg det till Henrik.
9. Svara Henrik kort på svenska: vad som publicerats, versionen, ångra-grenens namn och vad han bör känna efter i telefonen eller på väggskärmen.

## Får inte

- Pusha direkt till `main` utan ångra-gren och versionshöjning.
- Röra hushållskoden, `HOUSEHOLD_KEY` eller adressen i `config.js`.
