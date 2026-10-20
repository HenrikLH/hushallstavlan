# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Pågår nu

- UI 2.0:s inställningstema, ägare Codex, gren `codex/settings-ui2-tema`, [PR #19](https://github.com/HenrikLH/hushallstavlan/pull/19). Henrik vill behålla kategorier/Personer men återfå tydliga reglage och utfällbar hjälp.
- Kategorikroppen använder UI 2.0:s ursprungliga bakgrund; reglagens befintliga färger/former bevaras. `hjelpFold` körs per kategori med egna nycklar. Ingen ändring i Kod.gs eller hushållsdata.
- Arbetsversion ht-v172 / app.js?v=163. [CI 39458762181](https://github.com/HenrikLH/hushallstavlan/actions/runs/39458762181), testad commit `24ffd5a`: åtta gröna lägen, tre reglageformer/kontrast, hjälp öppna/stäng/omritning och tidigare funktionstester. UI 2.0:s övriga 18 vybilder matchar main. Skärmbilder granskade. Endast överlämning ändrad därefter; väntar på Henriks visuella godkännande före publicering.
- Publicerad main: ht-v171 / app.js?v=162, PR #18. Ångra-gren `version-fore-personer-20261020` (`ba7dd76`). Chromium saknas lokalt; använd CI.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
