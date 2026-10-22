# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Pågår nu

- Receptens knappar/filter: ägare Codex, gren `codex/recept-filter-forslag`. Henrik beställer först grundorsaksanalys och konkret lösningsförslag med skärmbilder före större ombyggnad.
- Förslag och avgränsning: `docs/recept-filter-forslag.md`. Prototyp i `verktyg/ux/recept-forslag.js`, endast laddad av eget emulatorscenario. Produktionskod/version och hushållsdata ändras inte.
- Återanvänd Inköps åtgärdsknappar och neutrala filterkapslar. En urvalsmodell med eget filterminne per underflik, kombinera mattyp/favorit/tid/storkok, full Rensa, korrekt träffantal/tomläge och arkivlänk vid Mina recept. Samlade kort, favoriter först. Befintlig editor/import/arkivsida behålls.
- Syntax/diff kontrollerade. CI telefon/vägg × ljust/mörkt och bildgranskning återstår. Nästa steg: visa komplett förslag för Henrik; därefter separat implementation om godkänt.

## Aktuell version

- ht-v174 / app.js?v=165, [PR #25](https://github.com/HenrikLH/hushallstavlan/pull/25), godkänd för publicering av Henrik. Inställningsförslag B (sammanhängande ruta, separat spår, ljust aktivt val) och neutral sökikon i samma färg som receptfältets platshållare.
- CSS begränsad till UI 2.0:s inställningsrutor; befintliga former och hjälp behålls. Gemensamma receptsökningen får SVG/44 px träffyta och behåller submit/Enter. Ingen Kod.gs- eller hushållsdataändring.
- Bestående expertarbetsprincip tillagd i AGENTS.md (även Claude). Receptknappar/filter analyserade; uppdragsprompt lämnas i PR-beskrivning. Endast B och sökikon implementeras nu; större receptombyggnad behöver ett konkret lösningsförslag.
- [CI 39736320731](https://github.com/HenrikLH/hushallstavlan/actions/runs/39736320731), kod/test-commit `3e68b8b`: åtta gröna lägen, tre reglageformer/kontrast, hjälppilar, sökikon/Enter, recept/synk och tidigare tester. UI 2.0:s 15 oförändrade vybilder matchar main. Telefon/vägg × ljust/mörkt bildgranskade; endast överlämning ändrad därefter.
- Ångra-gren `version-fore-installningar-b-20261022` från `17a8bf5` (ht-v173).

## Att veta vid övertagande

- Recept/färgfix från [PR #23](https://github.com/HenrikLH/hushallstavlan/pull/23) ingår. G-cirkeln följer accent/on-accent; H/C följer personfärger. matvaror.js?v=9.
- Recept: editor, sök/filter, granskad import, dubblettval, prisosäkerhet, offlineutkast, versioner, arkivering och konfliktkontroll. Matsedel bevaras tills valda måltider/inköp uttryckligen uppdateras.
- Väder-PR #20 är separat.
- Lagring, synk, importbegränsningar och serversteg: `docs/recipe-management-release.md`. Bilder: `outputs/recipe-management-implementation/`. Ingen Google-data ändrad av agenten. Henrik bekräftade 2026-10-21 att Kod.gs är uppdaterad, setupRecipes körd och ny webbappversion distribuerad.

## Väntar på Henrik


- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
