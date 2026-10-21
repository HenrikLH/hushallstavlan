# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- UI 2.0:s inställningstema, [PR #19](https://github.com/HenrikLH/hushallstavlan/pull/19), godkänt för publicering av Henrik. Kategorier/Personer behålls med tydliga reglage och utfällbar hjälp.
- Kategorikroppen använder UI 2.0:s ursprungliga bakgrund; reglagens befintliga färger/former bevaras. `hjelpFold` körs per kategori med egna nycklar. Ingen ändring i Kod.gs eller hushållsdata.
- Version ht-v172 / app.js?v=163. [CI 39458762181](https://github.com/HenrikLH/hushallstavlan/actions/runs/39458762181), testad commit `24ffd5a`: åtta gröna lägen, tre reglageformer/kontrast, hjälp öppna/stäng/omritning och tidigare funktionstester. UI 2.0:s övriga 18 vybilder matchar main. Skärmbilder granskade. Endast överlämning ändrad därefter.
- Ångra-gren `version-fore-installningstema-20261020` (`b6acaf0`, ht-v171). Chromium saknas lokalt; använd CI och återanvänd godkända resultat för oförändrad kod.

## Förberett, inte publicerat

- Dygnsgräns i översiktens väderremsa: godkänd förhandsvisning med tunn linje före midnatt och etikett som "Ons 00", utan markerad bakgrund.
- Ägare: Codex; gren `codex/weather-day-divider`. Berör bara `wallWx()` i app.js och `.bwx-h div.nd` i index.html; svep och väderlänken behålls.
- Henrik har uttryckligen bett att vänta med uppdateringen. Slå inte ihop eller publicera förrän han ber om det. Versionshöjning och ångra-gren görs inför publicering enligt AGENTS.md.
- Kontroll: JavaScript-syntax och alla flikar godkända på telefon (ljust) och vägg (ljust/mörkt), utan sidfel. Dygnsetikett, transparent bakgrund, tunn linje, horisontell scroll och midnatt som första timme verifierade; båda väggbilderna granskade.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
