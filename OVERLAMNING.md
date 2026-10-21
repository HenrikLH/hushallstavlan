# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- UI 2.0:s inställningstema, [PR #19](https://github.com/HenrikLH/hushallstavlan/pull/19), godkänt för publicering av Henrik. Kategorier/Personer behålls med tydliga reglage och utfällbar hjälp.
- Kategorikroppen använder UI 2.0:s ursprungliga bakgrund; reglagens befintliga färger/former bevaras. `hjelpFold` körs per kategori med egna nycklar. Ingen ändring i Kod.gs eller hushållsdata.
- Version ht-v172 / app.js?v=163. [CI 39458762181](https://github.com/HenrikLH/hushallstavlan/actions/runs/39458762181), testad commit `24ffd5a`: åtta gröna lägen, tre reglageformer/kontrast, hjälp öppna/stäng/omritning och tidigare funktionstester. UI 2.0:s övriga 18 vybilder matchar main. Skärmbilder granskade. Endast överlämning ändrad därefter.
- Ångra-gren `version-fore-installningstema-20261020` (`b6acaf0`, ht-v171). Chromium saknas lokalt; använd CI och återanvänd godkända resultat för oförändrad kod.

## Recept: plan och skisser, väntar på designgodkännande

- Ägare Codex; gren `codex/recipe-management-plan`, endast dokumentation och fristående ljus prototyp. Plan: `docs/recipe-management-plan.md`; prototyp: `docs/mockups/recipe-management.html`; bilder: `outputs/recipe-management/`.
- Henrik har bekräftat att receptredigering lämnar planerade måltider oförändrade; separat uppdatering kräver inköpsförhandsvisning. AI-fri import är föreslagen, svar om eventuell betald AI-integration inväntas.
- Nästa steg: invänta designgodkännande före produktionskod; gemensamt receptuppslag, versionslagring och säker synk kommer före redigering/import. Ny Kod.gs behövs senare, ingen Google-data ändrad nu.
- Kontroller: prototypens fyra ljusa bilder granskade; sök/filter, utkastfält, importreservväg och måltidsval provade, utan sidfel/horisontellt överflöde vid 320/390/736 px. Inga nya appfunktioner är implementerade eller testade.
- Ingen sammanslagning, serveruppdatering eller publicering utan uttryckligt ”Pusha”. Väderändringen är fortfarande separat i PR #20.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
