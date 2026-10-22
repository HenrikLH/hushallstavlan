# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- ht-v175 / app.js?v=166. Henrik har godkänt bilder och publicering (”Pusha”, 2026-10-22). Ägare Codex, gren `codex/plus-alternativ`. PR #26 är föregående prototyp och ersätts av implementationen.
- Utseende → Placering av plusknappen: Flytande / Vid profilen / Vid raden, per enhet. Recept öppnar Nytt/Importera; Uppgifter och Inköp återanvänder befintliga formulär/snabbfält. Delade mått/ikoner och neutralt sökfält.
- Recept har kombinerbara filter, full återställning/resultatantal/tomlägen, separat filterminne per underflik och arkivlänk vid Mina recept. Ny efterrätt får rätt kategori; orörda tomma utkast städas vid Avbryt.
- Lokalt grönt (appkod `d9a82be`): tre placeringar i telefon/vägg × ljust/mörkt; åtta UI2/UI3-röktester; recept-ui/reliability/server; UI-byte/inställningar/uppgifter/inköp. Åtta oförändrade vyer mot main i fyra lägen: 0 % pixeldiff. Bilder `outputs/plus-alternativ/`; CI på publiceringsgren/PR.
- Ångra-gren `version-fore-plus-alternativ-20261022` från `35ad0a2` (ht-v174). Ingen Kod.gs-ändring behövs; ingen riktig hushållsdata ändrad.

## Att veta vid övertagande

- Recept/färgfix från [PR #23](https://github.com/HenrikLH/hushallstavlan/pull/23) ingår. G-cirkeln följer accent/on-accent; H/C följer personfärger. matvaror.js?v=9.
- Recept: editor, sök/filter, granskad import, dubblettval, prisosäkerhet, offlineutkast, versioner, arkivering och konfliktkontroll. Matsedel bevaras tills valda måltider/inköp uttryckligen uppdateras.
- Väder-PR #20 är separat.
- Lagring, synk, importbegränsningar och serversteg: `docs/recipe-management-release.md`. Bilder: `outputs/recipe-management-implementation/`. Ingen Google-data ändrad av agenten. Henrik bekräftade 2026-10-21 att Kod.gs är uppdaterad, setupRecipes körd och ny webbappversion distribuerad.

## Väntar på Henrik


- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
