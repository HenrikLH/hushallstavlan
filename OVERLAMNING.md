# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- Release ht-v173 / app.js?v=164 / matvaror.js?v=9, [PR #23](https://github.com/HenrikLH/hushallstavlan/pull/23). Henrik godkände uttryckligen publicering av färgfix och recept. G-cirkeln följer accent/on-accent; H/C följer personfärger.
- Recept: editor, sök/filter, granskad import, dubblettval, prisosäkerhet, offlineutkast, versioner, arkivering och konfliktkontroll. Matsedel bevaras tills valda måltider/inköp uttryckligen uppdateras.
- [CI 39674579532](https://github.com/HenrikLH/hushallstavlan/actions/runs/39674579532), kod/test-commit `c452a7a`: åtta gröna lägen UI2/3 × telefon/vägg × ljust/mörkt, färgbyte/Min färg, recept/synk och befintliga funktionstester. Endast dokumentation ändrad därefter.
- Ångra-gren `version-fore-recept-anvandarfarger-20261021` från `003680f` (ht-v172). Ägare Codex, releasegren `codex/user-circle-colors`; PR #21/#22 ingår. Väder-PR #20 är separat.
- Lagring, synk, importbegränsningar och serversteg: `docs/recipe-management-release.md`. Bilder: `outputs/recipe-management-implementation/`. Ingen Google-data ändrad av agenten; serveruppdatering återstår nedan.

## Väntar på Henrik

- Publiceringstillstånd finns: klistra in hela uppdaterade Kod.gs från publicerad main på dator, kör `setupRecipes` och distribuera ny version. Ingen serveruppdatering är gjord. Gamla servern fungerar fortsatt men kan inte spara nya recept.

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
