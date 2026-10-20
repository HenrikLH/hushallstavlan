# Överlämning mellan agenter

Gemensam anteckningsbok för alla AI-agenter som jobbar i repot (Claude Code och Codex). Läs den innan du börjar och uppdatera den i samma commit som din ändring. Reglerna står i AGENTS.md, avsnitt 7.

## Pågår nu

Skriv in dig när du börjar något som tar mer än en push. Ta bort raden när du är klar.

| Sedan (UTC) | Agent | Gren | Område | Kort om vad |
|---|---|---|---|---|
| 2026-10-20 | Codex | `codex/samarbete-overlamning` | AGENTS.md / OVERLAMNING.md / .github/workflows/emu.yml | PR #16: uppdaterad efter Claudes testfixar; provar röktester via GitHub Actions. Se checkpoint nedan. |

## Debriefing till Claude – Codex 2026-10-20

- **Mål/gren:** fungerande tester och kort överlämning; `codex/samarbete-overlamning`, PR #16. Senaste main `b72a5f2` inhämtad, Claudes testfixar bevarade.
- **Område:** AGENTS.md avsnitt 6–7, denna fil och ny `.github/workflows/emu.yml`. Appen/Kod.gs är orörda; ht-v169 behålls.
- **Åtkomst:** GitHub-gren/commit/PR fungerar via integrationen; vanlig git-push saknar inloggning. Publicera via Git-objektverktygen och verifiera fjärrdiffen.
- **Testfixar:** den inaktuella varningen om ACT-anrop/felkod är borttagen. Main klickar nu på riktiga knappar, ger felkod vid scenariofel och har VP för väggtavlan.
- **Lokala tester:** telefon och vägg stoppas före appstart av saknad Chromium; nedladdningen gav HTML i stället för zip. Inga lokala appresultat är godkända.
- **Lösningsförsök:** nytt GitHub Actions-jobb installerar Playwright/Chromium före röktestet, kör telefon/vägg × light/dark och sparar skärmbilder. Resultat är ännu inte verifierade.
- **Miljö:** Claudes Setup script-råd gäller Codex Cloud (Legacy); denna chatt kör i ChatGPT Work. Miljöinställningarna kunde inte ändras här eftersom webbläsaren krävde inloggning.
- **Nästa steg:** publicera CI-förslaget, kontrollera alla fyra jobb och inspektera skärmbilder. Om skrivning till workflows nekas: lämna konkret installationsalternativ till Henrik. Ingen sammanslagning utan Henriks godkännande.

## Väntar på Henrik

Saker som bara Henrik kan göra (klistra in Kod.gs, testa på väggskärmen, välja design). Ta bort raden när han bekräftat.

- Väggskärmen: adaptiv ljusstyrka (ht-v163–v169) är bara testad med fejkad sensor i molnet. Henrik behöver bekräfta att den fungerar på Surface-datorn.

## Logg

Nyast överst. En rad per push till main.
Format: `datum UTC · agent · version · vad · ångra-gren · testat hur · kvar att göra`

- 2026-10-20 · Codex · ingen versionshöjning (dokumentationsförslag i PR, inte publicerat på main) · korta checkpoints och debriefing; Claudes testfixar inhämtade och gammal testvarning borttagen; föreslår röktest i GitHub Actions · main oförändrad, ångra-gren ej aktuell · diff-kontroll godkänd; telefon/vägg stoppade före appstart av saknad Chromium, ominstallation misslyckades · CI-resultat och granskning återstår
- 2026-10-20 · Claude · ingen versionshöjning (testverktyg) · alla-flikar.js klickar nu på riktiga knappar (nav, matTab, inställningar), run.js ger kod 1 vid SCENARIO FAIL, ny VP för fönsterstorlek (väggtavlan 1368x912) · – · telefon och väggtavla utan fel · –
- 2026-10-20 · Claude · ingen versionshöjning (bara dokumentation och testverktyg) · AGENTS.md, CLAUDE.md, OVERLAMNING.md och emulatorn verktyg/emu (med röktestet alla-flikar.js) tillagda så att Codex och Claude kan jobba i samma repo · ingen ångra-gren behövs, appen påverkas inte · röktestet kört i telefon- och väggläge utan fel · –
- 2026-10-19 · Claude · ht-v169 · lägsta ljusstyrka 1 % (app och ljustjänst) · se git-loggen för tidigare versioner · – · –
