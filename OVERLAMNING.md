# Aktuell överlämning

Claude och Codex: följ AGENTS.md avsnitt 7. Ersätt inaktuell status; historik och detaljer finns i git/PR/CI.

## Aktuell version

- ht-v175 / app.js?v=166, [PR #27](https://github.com/HenrikLH/hushallstavlan/pull/27). Henrik har godkänt bilder och publicering (”Pusha”, 2026-10-22). Ägare Codex, gren `codex/plus-alternativ`. PR #26 är föregående prototyp och ersätts av implementationen.
- Utseende → Placering av plusknappen: Flytande / Vid profilen / Vid raden, per enhet. Recept öppnar Nytt/Importera; Uppgifter och Inköp återanvänder befintliga formulär/snabbfält. Delade mått/ikoner och neutralt sökfält.
- Recept har kombinerbara filter, full återställning/resultatantal/tomlägen, separat filterminne per underflik och arkivlänk vid Mina recept. Ny efterrätt får rätt kategori; orörda tomma utkast städas vid Avbryt.
- Lokalt grönt (appkod `d9a82be`): tre placeringar i telefon/vägg × ljust/mörkt; åtta UI2/UI3-röktester; recept-ui/reliability/server; UI-byte/inställningar/uppgifter/inköp. Åtta oförändrade vyer mot main i fyra lägen: 0 % pixeldiff. Bilder `outputs/plus-alternativ/`; CI på publiceringsgren/PR.
- Ångra-gren `version-fore-plus-alternativ-20261022` från `35ad0a2` (ht-v174). Ingen Kod.gs-ändring behövs; ingen riktig hushållsdata ändrad.

## Senaste rättning: Städ följer profilpluset

- ht-v176 / app.js?v=167. Henrik godkände publicering 2026-10-23 (”Pusha”). Ägare Codex, gren `codex/stad-plus-profil`.
- Vid profilen visar Städ samma huvudknapp och döljer bara övre Ny syssla-fältet; Flytande/Vid raden och rumsfälten behålls. Profilpluset öppnar Ny syssla-bladet med befintlig sparning.
- Lokalt godkänt på `fc38f97`: telefon/vägg × ljust/mörkt inkl. UI3, omstart, Avbryt, sparning via blad/snabbfält samt `ui-versioner.js`. Bilder `outputs/stad-plus-profil/`.
- Ångra-gren `version-fore-stad-plus-20261023` från `1ceaa85` (ht-v175). Ingen Kod.gs-ändring eller riktig hushållsdata ändrad.

## Att veta vid övertagande

- ht-v177 / app.js?v=168: Codex `codex/matsedel-gester`. Henrik godkände bilder och publicering 2026-10-24. Datumspärr/automatisk Ätit borttagen; svep/radering/låsning fungerar hela visade veckan.
- Test: telefon/vägg × ljust/mörkt över torsdag–lördag; båda låsstilarna via inställningar/omladdning, hålltryck och svep, låst borttagning/Avbryt samt sparning. Alla-flikar telefon/vägg. Bilder `outputs/matsedel-gester/`.
- Ångra-gren `version-fore-matsedel-gester-20261024` från `22106b6` (ht-v176). Ingen Kod.gs-ändring eller riktig hushållsdata ändrad.

- Recept/färgfix från [PR #23](https://github.com/HenrikLH/hushallstavlan/pull/23) ingår. G-cirkeln följer accent/on-accent; H/C följer personfärger. matvaror.js?v=9.
- Recept: editor, sök/filter, granskad import, dubblettval, prisosäkerhet, offlineutkast, versioner, arkivering och konfliktkontroll. Matsedel bevaras tills valda måltider/inköp uttryckligen uppdateras.
- Väder-PR #20 är separat.
- Lagring, synk, importbegränsningar och serversteg: `docs/recipe-management-release.md`. Bilder: `outputs/recipe-management-implementation/`. Ingen Google-data ändrad av agenten. Henrik bekräftade 2026-10-21 att Kod.gs är uppdaterad, setupRecipes körd och ny webbappversion distribuerad.

## Väntar på Henrik


- Bekräfta UI 3.0 med iPhone-tangentbord och på Surface; verklig hårdvara kan inte verifieras i molnet.
- Bekräfta adaptiv ljusstyrka på Surface-skärmen (ht-v163–v169); hårdvaran kan inte verifieras i molnet.
