# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- UI 2.0:s inställningstema, [PR #19](https://github.com/HenrikLH/hushallstavlan/pull/19), godkänt för publicering av Henrik. Kategorier/Personer behålls med tydliga reglage och utfällbar hjälp.
- Kategorikroppen använder UI 2.0:s ursprungliga bakgrund; reglagens befintliga färger/former bevaras. `hjelpFold` körs per kategori med egna nycklar. Ingen ändring i Kod.gs eller hushållsdata.
- Version ht-v172 / app.js?v=163. [CI 39458762181](https://github.com/HenrikLH/hushallstavlan/actions/runs/39458762181), testad commit `24ffd5a`: åtta gröna lägen, tre reglageformer/kontrast, hjälp öppna/stäng/omritning och tidigare funktionstester. UI 2.0:s övriga 18 vybilder matchar main. Skärmbilder granskade. Endast överlämning ändrad därefter.
- Ångra-gren `version-fore-installningstema-20261020` (`b6acaf0`, ht-v171). Chromium saknas lokalt; använd CI och återanvänd godkända resultat för oförändrad kod.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
