# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- UI 2.0:s inställningstema, [PR #19](https://github.com/HenrikLH/hushallstavlan/pull/19), godkänt för publicering av Henrik. Kategorier/Personer behålls med tydliga reglage och utfällbar hjälp.
- Kategorikroppen använder UI 2.0:s ursprungliga bakgrund; reglagens befintliga färger/former bevaras. `hjelpFold` körs per kategori med egna nycklar. Ingen ändring i Kod.gs eller hushållsdata.
- Version ht-v172 / app.js?v=163. [CI 39458762181](https://github.com/HenrikLH/hushallstavlan/actions/runs/39458762181), testad commit `24ffd5a`: åtta gröna lägen, tre reglageformer/kontrast, hjälp öppna/stäng/omritning och tidigare funktionstester. UI 2.0:s övriga 18 vybilder matchar main. Skärmbilder granskade. Endast överlämning ändrad därefter.
- Ångra-gren `version-fore-installningstema-20261020` (`b6acaf0`, ht-v171). Chromium saknas lokalt; använd CI och återanvänd godkända resultat för oförändrad kod.

## Recept: implementerat, väntar på Pusha

- Ägare Codex; gren `codex/recipe-management`, bas `003680f`. Henrik godkände Runda + Piller och bad börja implementationen. Plan/skisser i PR #21; väder-PR #20 är separat.
- Klart: editor, standard-sök/filter, granskad länk/textimport, dubblettval, källor, prisosäkerhet, utkast/offline, versionslagring, arkivera/återställa och konfliktkontroll. Matsedel bevaras; valda måltider uppdateras endast efter inköpsgranskning.
- Lagring/synk/kompatibilitet, importgränser och framtida serversteg: `docs/recipe-management-release.md`. Faktiska bilder: `outputs/recipe-management-implementation/`; tidigare bilder i `outputs/recipe-management/` är skisser.
- Lokalt grönt: serverfel/återförsök, receptflöden i telefon/vägg ljust/mörkt, tvåenhetskonflikt, offline, dubbletter, foto, äldre kopior och gammal server. Befintliga UI3-telefon/UI2-vägg-funktionstester gröna. CI-resultat och testad commit finns i implementations-PR.
- Nästa steg: granska implementations-PR/CI och riktiga bilder. Ingen main-merge, publicering eller Google-ändring utan ”Pusha”. Versionshöjningar väntar till dess (app/sw/matvaror).

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
