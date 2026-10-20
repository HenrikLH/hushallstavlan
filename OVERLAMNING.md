# Överlämning mellan agenter

Gemensam anteckningsbok för alla AI-agenter som jobbar i repot (Claude Code och Codex). Läs den innan du börjar och uppdatera den i samma commit som din ändring. Reglerna står i AGENTS.md, avsnitt 7.

## Pågår nu

Skriv in dig när du börjar något som tar mer än en push. Ta bort raden när du är klar.

| Sedan (UTC) | Agent | Gren | Område | Kort om vad |
|---|---|---|---|---|
| 2026-10-20 | Codex | `codex/samarbete-overlamning` | AGENTS.md / OVERLAMNING.md | Dokumentationsförslag i utkast-PR; GitHub-skrivning verifierad, emulator blockerad före appstart. Se checkpoint nedan. |

## Debriefing till Claude – Codex 2026-10-20

- **Mål/gren:** kort överlämning vid användningsgräns; `codex/samarbete-overlamning`, bas `f2eaa35`. Aktuell commit och diff finns i PR:en.
- **Område:** endast AGENTS.md avsnitt 6–7 och denna fil. Appen och Kod.gs är orörda; ht-v169 behålls.
- **Åtkomst:** GitHub-installationen på HenrikLH är nu synlig; skapande av arbetsgren via integrationen lyckades. Vanlig git-push saknar fortfarande inloggning; publicera via integrationens Git-objekt och PR-verktyg.
- **Samordning:** inga öppna PR:er vid kontrollen; senaste lokalt kända Claude-gren pekar på main. Kontrollera på nytt före fortsatt arbete.
- **Testat:** senaste main hämtad, regler/överlämning och 20 commits lästa; `git diff --check` godkänd. Både telefon- och väggkommandot kördes och gav exitkod 1 före appstart (Chromium saknas).
- **Hinder:** Playwrights installation av Chromium headless shell försöktes på nytt; samtliga nedladdningsförsök gav ogiltig/tom zip. Inga emulatorresultat eller skärmbilder är godkända från denna miljö.
- **Testfallgrop:** alla-flikar anropar ACT direkt; run.js kan fånga SCENARIO FAIL utan felkod. Dokumenterat, testverktygen inte ändrade.
- **Beslut/nästa steg:** lämna dokumentationen som utkast-PR, ordna Chromium i en fungerande testmiljö och kör båda röktesterna samt riktiga klick. Henrik godkänner innan sammanslagning; ingen ny appfunktion påbörjad.

## Väntar på Henrik

Saker som bara Henrik kan göra (klistra in Kod.gs, testa på väggskärmen, välja design). Ta bort raden när han bekräftat.

- Väggskärmen: adaptiv ljusstyrka (ht-v163–v169) är bara testad med fejkad sensor i molnet. Henrik behöver bekräfta att den fungerar på Surface-datorn.

## Logg

Nyast överst. En rad per push till main.
Format: `datum UTC · agent · version · vad · ångra-gren · testat hur · kvar att göra`

- 2026-10-20 · Codex · ingen versionshöjning (dokumentationsförslag i PR, inte publicerat på main) · korta checkpoints och testbegränsningar dokumenterade; GitHub-gren skapad via integrationen · main oförändrad, ångra-gren ej aktuell · diff-kontroll godkänd; telefon/vägg stoppade före appstart av saknad Chromium, ominstallation misslyckades · fungerande emulator och granskning återstår
- 2026-10-20 · Claude · ingen versionshöjning (bara dokumentation och testverktyg) · AGENTS.md, CLAUDE.md, OVERLAMNING.md och emulatorn verktyg/emu (med röktestet alla-flikar.js) tillagda så att Codex och Claude kan jobba i samma repo · ingen ångra-gren behövs, appen påverkas inte · röktestet kört i telefon- och väggläge utan fel · –
- 2026-10-19 · Claude · ht-v169 · lägsta ljusstyrka 1 % (app och ljustjänst) · se git-loggen för tidigare versioner · – · –
