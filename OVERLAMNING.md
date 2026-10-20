# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Pågår nu

Ingen aktiv utvecklingsuppgift. UI 3.0 levereras i ht-v170 / app.js?v=161 via [PR #17](https://github.com/HenrikLH/hushallstavlan/pull/17), med Henriks publiceringsgodkännande.

## Att veta vid övertagande

- UI 3.0 väljs per enhet under Inställningar → Utvecklarläge → Design (i UI 3.0 ligger utvecklarvalen under Avancerat). Avstängt utvecklarläge återgår till UI 2.0, som fortsatt är standard. UI 2.0:s stil- och layoutval bevaras. Ingen ändring i Kod.gs.
- Verifierat: [CI 39433979642](https://github.com/HenrikLH/hushallstavlan/actions/runs/39433979642), app/test-commit `c0d49c9`: åtta gröna lägen (UI 2/3 × telefon/vägg × ljust/mörkt), funktionstester samt UI 2.0-bildjämförelse mot main. Utvecklarvalets synlighet och återgång efter omstart ingår. Endast denna överlämning ändrades efter grön CI.
- Ångra-gren: `version-fore-ui3-20261020` (`0d30ab9`). Skärmbilder finns i CI i sju dagar. Chromium saknas lokalt i Codex; använd CI och återanvänd godkända resultat för samma app/test-kod.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
