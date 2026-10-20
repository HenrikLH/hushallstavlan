# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Pågår nu

- **UI 3.0**, ägare Codex, gren `codex/ui-3-0`. Frivilligt val i Inställningar; UI 2.0 ska behålla befintligt utseende och beteende.
- Gemensamma komponenter, Idag/vägg, receptsökning, enklare inköpsåtgärder och grupperade inställningar. Ingen ändring i Kod.gs.
- Lokal syntax/diff kontrollerad. Nästa steg: CI telefon/vägg × ljust/mörkt × UI 2/3, funktionstester och bildjämförelse mot main. Rätta utfall och granska skärmbilder före färdig PR.
- Arbetsversion ht-v170 / app.js?v=161. Inte publicerad till main; Henrik ska se och godkänna bilderna före sammanslagning.

## Att veta vid övertagande

- Röktest i `.github/workflows/emu.yml`: telefon/vägg × ljust/mörkt; bilder sparas i sju dagar. Rena dokumentations-PR:er undantas.
- Senast verifierat: [CI 39409184761](https://github.com/HenrikLH/hushallstavlan/actions/runs/39409184761), commit `55ef626`: fyra gröna lägen. Appversion ht-v169. Lokal Chromium saknas i Codex-miljön; använd CI.

## Väntar på Henrik

- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
