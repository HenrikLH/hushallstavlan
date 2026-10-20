# Överlämning mellan agenter

Gemensam anteckningsbok för alla AI-agenter som jobbar i repot (Claude Code och Codex). Läs den innan du börjar och uppdatera den i samma commit som din ändring. Reglerna står i AGENTS.md, avsnitt 7.

## Pågår nu

Skriv in dig när du börjar något som tar mer än en push. Ta bort raden när du är klar.

| Sedan (UTC) | Agent | Gren | Område | Kort om vad |
|---|---|---|---|---|
| – | – | – | – | – |

## Debriefing till Claude – Codex 2026-10-20

- **Mål/gren:** fungerande tester och kort överlämning; `codex/samarbete-overlamning`, PR #16. Senaste main `b72a5f2` inhämtad, Claudes testfixar bevarade.
- **Område:** AGENTS.md avsnitt 6–7, denna fil och ny `.github/workflows/emu.yml`. Appen/Kod.gs är orörda; ht-v169 behålls.
- **Åtkomst:** GitHub-gren/commit/PR fungerar via integrationen; vanlig git-push saknar inloggning. Publicera via Git-objektverktygen och verifiera fjärrdiffen.
- **Testfixar:** den inaktuella varningen om ACT-anrop/felkod är borttagen. Main klickar nu på riktiga knappar, ger felkod vid scenariofel och har VP för väggtavlan.
- **Lokala tester:** telefon och vägg stoppas före appstart av saknad Chromium; nedladdningen gav HTML i stället för zip. Inga lokala appresultat är godkända.
- **Verifierat i CI:** körning [39408739892](https://github.com/HenrikLH/hushallstavlan/actions/runs/39408739892), commit `e89f5be`: alla fyra jobb godkända (telefon/vägg × light/dark), 14 bilder per jobb, inga PAGEERROR/SCENARIO FAIL. Alla 56 bilder visuellt kontrollerade i kontaktkartor; översikten sammanställd för Henrik. Ekonomi är avsiktligt låst på gemensam väggskärm; testet verifierar navigering, inte alla affärsflöden.
- **Miljö:** Claudes Setup script-råd gäller Codex Cloud (Legacy); denna chatt kör i ChatGPT Work. Miljöinställningarna kunde inte ändras här eftersom webbläsaren krävde inloggning.
- **Nästa steg:** Henrik granskar PR #16 och godkänner sammanslagning. CI kan nu användas av båda agenterna utan ändrad internetåtkomst i agentmiljön. Appversionen är oförändrad; ingen sammanslagning gjord.

## Väntar på Henrik

Saker som bara Henrik kan göra (klistra in Kod.gs, testa på väggskärmen, välja design). Ta bort raden när han bekräftat.

- PR #16: granska samarbetsreglerna och nya CI-röktestet; fyra lägen godkända. Sammanslagning inväntar Henriks uttryckliga godkännande.
- Väggskärmen: adaptiv ljusstyrka (ht-v163–v169) är bara testad med fejkad sensor i molnet. Henrik behöver bekräfta att den fungerar på Surface-datorn.

## Logg

Nyast överst. En rad per push till main.
Format: `datum UTC · agent · version · vad · ångra-gren · testat hur · kvar att göra`

- 2026-10-20 · Codex · ingen versionshöjning (dokumentation/testverktyg i PR, inte publicerat på main) · korta checkpoints och debriefing; Claudes testfixar inhämtade och gammal testvarning borttagen; röktest i GitHub Actions · main oförändrad, ångra-gren ej aktuell · diff/syntax/YAML godkända; CI 39408739892: telefon/vägg × ljust/mörkt gröna, 56 skärmbilder kontrollerade; lokal Chromium saknas fortfarande · Henriks granskning återstår
- 2026-10-20 · Claude · ingen versionshöjning (testverktyg) · alla-flikar.js klickar nu på riktiga knappar (nav, matTab, inställningar), run.js ger kod 1 vid SCENARIO FAIL, ny VP för fönsterstorlek (väggtavlan 1368x912) · – · telefon och väggtavla utan fel · –
- 2026-10-20 · Claude · ingen versionshöjning (bara dokumentation och testverktyg) · AGENTS.md, CLAUDE.md, OVERLAMNING.md och emulatorn verktyg/emu (med röktestet alla-flikar.js) tillagda så att Codex och Claude kan jobba i samma repo · ingen ångra-gren behövs, appen påverkas inte · röktestet kört i telefon- och väggläge utan fel · –
- 2026-10-19 · Claude · ht-v169 · lägsta ljusstyrka 1 % (app och ljustjänst) · se git-loggen för tidigare versioner · – · –
