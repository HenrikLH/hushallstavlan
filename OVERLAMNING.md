# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Pågår nu

- **UI 3.0**, ägare Codex, gren `codex/ui-3-0`, [PR #17](https://github.com/HenrikLH/hushallstavlan/pull/17). Implementerat, väntar på Henriks visuella godkännande före main.
- Val per enhet i Inställningar. UI 2.0 är standard; dess stil- och layoutval bevaras. Ingen ändring i Kod.gs.
- Gemensamma komponenter, Idag/vägg, receptsökning, inköpsmeny, grupperade inställningar och lugnare rörelser. Arbetsversion ht-v170 / app.js?v=161.
- Verifierat: [CI 39432075068](https://github.com/HenrikLH/hushallstavlan/actions/runs/39432075068), app/test-commit `af52768`: åtta gröna lägen (UI 2/3 × telefon/vägg × ljust/mörkt). Alla vyer samt skapa/ändra/avbocka uppgifter, kalender, inköp, matlagning, städ och UI-byte/omstart. UI 2.0 jämförs mot main i 18 bilder per läge. Skärmbilder finns i CI i sju dagar.
- Nästa steg: efter godkännande, hämta main och kontrollera versionerna, skapa ångra-gren och slå ihop #17. Kontrollera Pages och låt Henrik bekräfta iPhone-tangentbord/Surface; verklig hårdvara är inte verifierad i molnet.

## Att veta vid övertagande

- Chromium kan inte laddas ned lokalt i Codex-miljön; använd `.github/workflows/emu.yml`. Ingen ytterligare omkörning behövs för samma app/test-kod. Endast överlämning ändrades efter grön CI.

## Väntar på Henrik

- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
