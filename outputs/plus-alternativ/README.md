# Plusknappar – bildgranskning

Henrik har godkänt bilderna och publicering (”Pusha”, 2026-10-22). Ingår i ht-v175 / app.js?v=166, gren `codex/plus-alternativ`.

Inställningar → Utseende → Placering av plusknappen: **Flytande / Vid profilen / Vid raden**. Valet sparas per enhet, standard Vid profilen. Receptpluset öppnar Nytt recept och Importera recept; Uppgifter och Inköp använder sina egna formulär och snabbfält. Söka och skapa är separata kontroller.

| Jämförelse | Mörkt | Ljust |
|---|---|---|
| Recept A/B/C | [Bild](recept-dark.png) | [Bild](recept-light.png) |
| Uppgifter A/B/C | [Bild](uppgifter-dark.png) | [Bild](uppgifter-light.png) |
| Inställningar | [Bild](telefon-dark/installningar.png) | [Bild](telefon-light/installningar.png) |
| Vägg, plusmeny | [Bild](vagg-dark/profil-meny.png) | [Bild](vagg-light/profil-meny.png) |
| Vägg, kalender | [Bild](vagg-dark/rad-kalender.png) | [Bild](vagg-light/rad-kalender.png) |

Bilderna är faktiska Chromium-skärmbilder med emulerade testdata. Samma innehåll används i alternativen. UI 2.0:s färgtokens/formval återanvänds. Sidmarginal 16 px, kontrollavstånd 10–12 px, gemensamma filter/åtgärder minst 44 px, flytande cirkel 56 px. Ingen produktionsdata ändrad.

Appkod testad: `d9a82be`. Lokalt grönt: åtta UI2/UI3-röklägen; tre plusplaceringar i telefon/vägg × ljust/mörkt inklusive omladdning; sökikon/Enter, kombinerade filter/återställning/tomläge, favorit, uppgifts-API, lista/kalender och oförändrad matsedel/inköp. Befintliga tester för server, editor, import, utkast, arkiv/återställning, offline och synkkonflikter passerar. Åtta oförändrade vyer jämförda mot main i fyra lägen: 0 % pixeldiff.

Verkligt iPhone-tangentbord och Surface-pekskärm återstår. Ingen Kod.gs-ändring behövs. Ångra-gren: `version-fore-plus-alternativ-20261022` från `35ad0a2` (ht-v174).
