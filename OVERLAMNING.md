# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- Inställningar och Personer godkända för publicering av Henrik, [PR #18](https://github.com/HenrikLH/hushallstavlan/pull/18), ht-v171 / app.js?v=162. Användarval, namn och färg samlade; UI 2.0 behåller sitt tema. Ingen ändring i Kod.gs.
- Verifierat: [CI 39451054291](https://github.com/HenrikLH/hushallstavlan/actions/runs/39451054291), app/test-commit `d945d81`: åtta gröna lägen, personkopplingar och bildjämförelse av övriga UI 2.0-vyer. Endast överlämningen ändrad därefter.
- Ångra-gren: `version-fore-personer-20261020` (`ba7dd76`). Chromium saknas lokalt; använd CI och återanvänd godkända resultat för samma app/test-kod.
- UI 3.0 är valbar per enhet under Inställningar → Avancerat → Utvecklarläge → Design. Avstängt utvecklarläge återgår till UI 2.0. Personers stabila datanycklar och visningsnamn beskrivs i AGENTS.md.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
