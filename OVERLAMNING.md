# Överlämning mellan agenter

Gemensam anteckningsbok för alla AI-agenter som jobbar i repot (Claude Code och Codex). Läs den innan du börjar och uppdatera den i samma commit som din ändring. Reglerna står i AGENTS.md, avsnitt 7.

## Pågår nu

Skriv in dig när du börjar något som tar mer än en push. Ta bort raden när du är klar.

| Sedan (UTC) | Agent | Gren | Område | Kort om vad |
|---|---|---|---|---|
| – | – | – | – | – |

## Väntar på Henrik

Saker som bara Henrik kan göra (klistra in Kod.gs, testa på väggskärmen, välja design). Ta bort raden när han bekräftat.

- Väggskärmen: adaptiv ljusstyrka (ht-v163–v169) är bara testad med fejkad sensor i molnet. Henrik behöver bekräfta att den fungerar på Surface-datorn.

## Logg

Nyast överst. En rad per push till main.
Format: `datum UTC · agent · version · vad · ångra-gren · testat hur · kvar att göra`

- 2026-10-20 · Claude · ingen versionshöjning (testverktyg) · alla-flikar.js klickar nu på riktiga knappar (nav, matTab, inställningar), run.js ger kod 1 vid SCENARIO FAIL, ny VP för fönsterstorlek (väggtavlan 1368x912) · – · telefon och väggtavla utan fel · –
- 2026-10-20 · Claude · ingen versionshöjning (bara dokumentation och testverktyg) · AGENTS.md, CLAUDE.md, OVERLAMNING.md och emulatorn verktyg/emu (med röktestet alla-flikar.js) tillagda så att Codex och Claude kan jobba i samma repo · ingen ångra-gren behövs, appen påverkas inte · röktestet kört i telefon- och väggläge utan fel · –
- 2026-10-19 · Claude · ht-v169 · lägsta ljusstyrka 1 % (app och ljustjänst) · se git-loggen för tidigare versioner · – · –
