# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- UI 2.0:s inställningstema, [PR #19](https://github.com/HenrikLH/hushallstavlan/pull/19), godkänt för publicering av Henrik. Kategorier/Personer behålls med tydliga reglage och utfällbar hjälp.
- Kategorikroppen använder UI 2.0:s ursprungliga bakgrund; reglagens befintliga färger/former bevaras. `hjelpFold` körs per kategori med egna nycklar. Ingen ändring i Kod.gs eller hushållsdata.
- Version ht-v172 / app.js?v=163. [CI 39458762181](https://github.com/HenrikLH/hushallstavlan/actions/runs/39458762181), testad commit `24ffd5a`: åtta gröna lägen, tre reglageformer/kontrast, hjälp öppna/stäng/omritning och tidigare funktionstester. UI 2.0:s övriga 18 vybilder matchar main. Skärmbilder granskade. Endast överlämning ändrad därefter.
- Ångra-gren `version-fore-installningstema-20261020` (`b6acaf0`, ht-v171). Chromium saknas lokalt; använd CI och återanvänd godkända resultat för oförändrad kod.

## Recept och användarcirkel: godkänt för publicering

- Ägare Codex; gren `codex/recipe-management`, [PR #22](https://github.com/HenrikLH/hushallstavlan/pull/22), bas `003680f`. Henrik godkände Runda + Piller och bad börja implementationen. Plan/skisser i PR #21; väder-PR #20 är separat.
- Klart: editor, standard-sök/filter, granskad länk/textimport, dubblettval, källor, prisosäkerhet, utkast/offline, versionslagring, arkivera/återställa och konfliktkontroll. Matsedel bevaras; valda måltider uppdateras endast efter inköpsgranskning.
- Lagring/synk/kompatibilitet, importgränser och framtida serversteg: `docs/recipe-management-release.md`. Faktiska bilder: `outputs/recipe-management-implementation/`; tidigare bilder i `outputs/recipe-management/` är skisser.
- Grönt: [CI 39667146110](https://github.com/HenrikLH/hushallstavlan/actions/runs/39667146110), testad commit `3adae14`, åtta lägen (UI2/3 × telefon/vägg × ljust/mörkt), oförändrade UI2-vyer matchar main. Serverfel/återförsök, offline, dubbletter, foto, äldre kopior, full receptbank och synk testade. Gammal server och UI1 testade lokalt. Endast dokumentation ändrad därefter.
- Henrik har uttryckligen godkänt publicering av både recept och färgfix. Releasegren `codex/user-circle-colors`, ht-v173/app164/matvaror9; G använder accent/on-accent, H/C behåller personfärger. Nästa steg: grön release-CI, ångra-gren, merge och verifierad Pages. Ingen Google-data ändrad.

## Väntar på Henrik

- Publiceringstillstånd finns: klistra in hela uppdaterade Kod.gs från publicerad main på dator, kör `setupRecipes` och distribuera ny version. Ingen serveruppdatering är gjord. Gamla servern fungerar fortsatt men kan inte spara nya recept.

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
