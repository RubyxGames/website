---
title: Шаблоны Blueprint
outline: deep
description: "Empty, SkyWars, DbD и NG-inspired шаблоны мини-игр."
---

# Templates

Blueprint templates live in `templates/*/`. Each has `project.json`, `blueprints/*.json`, `variables/global.json`, `resources/config.yml` + `resources/lang/`, plus `cover.jpg` (also mirrored to `frontend/public/templates/{id}.jpg` for the dashboard).

Create a project via API/UI with `templateId` = template `id` (aliases in `TemplateService`).

Kit items in config (`skywars.kits`, `duels.kits`, …) render with Bedrock/Java item icons in Project → Resources (CDN textures via `bedrockItems`).

## EmptyMiniGame (MVP)

Graphs: Main, GameType, Events. Acceptance: Join → Message compiles and runs.

## SkyWars (full)

Full island SkyWars loop on MiniGameBase:

- Default map stub: `dbd_1` (copy `arena_templates` / `default_maps` from `resources/config.yml` into MiniGameBase)
- Lobby countdown → cage clock → kits on open → island/middle chests → refill → mid-event → soft border + compass tracker → last-alive win / spectator / rewards stats
- Runtime helper: generated `SkyWarsSupport` (driven by `sw.*` nodes + `resources/config.yml` → `skywars:`)
- Graphs: Main, GameType, Lobby, CageOpen, Kits, Chests, MatchTimer, WinCheck, Spectator, Rewards, Events, Scoreboard
- Nodes: `sw.startMatchClock`, `sw.openCages`, `sw.fillChests`, `sw.giveKit`, `sw.spawnMidEvent`, `sw.onPlayerDeath`, `sw.onGameEnd`, `sw.cancelClock`

Reference for *design only* (not a code port): [NetherGames Skywars](https://github.com/NetherGamesMC/plugins/tree/master/Skywars).

## DeadByDaylight (`dbd`)

Graphs: Main, GameType, Generators, Hooks, ExitGates, Events — blueprint scaffold for DbD-style modes.

## NetherGames-inspired arena templates

Design-only scaffolds (MiniGameBase graphs + config/lang). **Not** PHP ports of NG. Domain steps that need custom modules are stubbed with `util.php` comments.

Skipped from NG monorepo: **Skywars** (already have full template), **Lobby / NGEssentials / Factions / SkyBlock** (network/lobby/survival — not arena MiniGameBase modes).

| Template id | Folder | NG reference | Focus graphs |
|-------------|--------|--------------|--------------|
| `bedwars` | Bedwars | [Bedwars](https://github.com/NetherGamesMC/plugins/tree/master/Bedwars) | Match, Generators, Beds, Shops — runtime via MiniGameBase `teamgame` module (`mg.startTeamMatch`, `mg.openItemShop`, …) |
| `murdermystery` | MurderMystery | [MurderMystery](https://github.com/NetherGamesMC/plugins/tree/master/MurderMystery) | Match, Roles |
| `thebridge` | TheBridge | [TheBridge](https://github.com/NetherGamesMC/plugins/tree/master/TheBridge) | Match, Rounds, Scoring |
| `duels` | Duels | [Duels](https://github.com/NetherGamesMC/plugins/tree/master/Duels) | Match, Kits |
| `survivalgames` | SurvivalGames | [SurvivalGames](https://github.com/NetherGamesMC/plugins/tree/master/SurvivalGames) | Match, Chests, Border, Cages |
| `soccer` | Soccer | [Soccer](https://github.com/NetherGamesMC/plugins/tree/master/Soccer) | Match, Goals |
| `meltdown` | Meltdown | [Meltdown](https://github.com/NetherGamesMC/plugins/tree/master/Meltdown) | Match, Platforms |
| `mommasays` | MommaSays | [MommaSays](https://github.com/NetherGamesMC/plugins/tree/master/MommaSays) | Match, Rounds |
| `conquests` | Conquests | [Conquests](https://github.com/NetherGamesMC/plugins/tree/master/Conquests) | Match, Generators, Points |
| `uhc` | UHC | [UHC](https://github.com/NetherGamesMC/plugins/tree/master/UHC) | Match, Border, Scenarios |

Shared graph set on each: Main, GameType, Lobby, WinCheck, Spectator, Rewards, Events, Scoreboard (+ mode extras above).

### Compile smoke

```bash
php compiler/bin/compile.php templates/Bedwars ./out/Bedwars
php compiler/bin/compile.php templates/MurderMystery ./out/MurderMystery
# …
```

Replace stub worlds in `resources/config.yml` (`bw_1`, `mm_1`, …) with real maps before pushing to a live server.
