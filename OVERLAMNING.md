# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Pågår nu

- **Inställningar och Personer**, ägare Codex, gren `codex/settings-personer`, [PR #18](https://github.com/HenrikLH/hushallstavlan/pull/18). Henrik godkände utfällbar pil för namn/färg och kategorier i UI 2.0 med bibehållet tema.
- Användarval, namn och färg samlas. Personers datanycklar bevaras; visningsnamn sparas i befintliga raden `personer`, utan ändring i Kod.gs. Se AGENTS.md.
- Verifierat: [CI 39451054291](https://github.com/HenrikLH/hushallstavlan/actions/runs/39451054291), app/test-commit `d945d81`: åtta gröna lägen. Namn/färg, Avbryt/utkast, omstart och stabila uppgifts-/kalender-/ekonomi-/betygskopplingar testade; övriga UI 2.0-vyer bildjämförda mot main. Bilder granskade. Endast överlämning ändrad efter grön CI.
- Arbetsversion ht-v171 / app.js?v=162. Nästa steg: Henriks visuella godkännande, hämta main och kontrollera versionerna, ångra-gren, sammanslagning och Pages-kontroll.

## Att veta vid övertagande

- UI 3.0 väljs per enhet under Inställningar → Utvecklarläge → Design (i UI 3.0 ligger utvecklarvalen under Avancerat). Avstängt utvecklarläge återgår till UI 2.0, som fortsatt är standard. UI 2.0:s stil- och layoutval bevaras. Ingen ändring i Kod.gs.
- Verifierat: [CI 39433979642](https://github.com/HenrikLH/hushallstavlan/actions/runs/39433979642), app/test-commit `c0d49c9`: åtta gröna lägen (UI 2/3 × telefon/vägg × ljust/mörkt), funktionstester samt UI 2.0-bildjämförelse mot main. Utvecklarvalets synlighet och återgång efter omstart ingår. Endast denna överlämning ändrades efter grön CI.
- Ångra-gren: `version-fore-ui3-20261020` (`0d30ab9`). Skärmbilder finns i CI i sju dagar. Chromium saknas lokalt i Codex; använd CI och återanvänd godkända resultat för samma app/test-kod.

## Väntar på Henrik

- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
