---
title: Компилятор Blueprint
outline: deep
description: "Пайплайн IR → PHP-плагин MiniGameBase."
---

# Compiler pipeline

1. **Load** project payload (graphs, variables, resources)
2. **Parse** → normalized namespace / GameType class names
3. **Validate** → unique node ids, edges, anti-patterns (`mg.registerGameType` only in `Main`)
4. **IR** → blocks + CFG per graph
5. **Generate** → DbDGame-aligned plugin layout (see below)
6. **Merge auxiliary graphs** into hooks (`Lobby`→`onLobbyStart`, `Chests`/`Scoreboard`/`Generators`→`onGameStart`, `WinCheck`/`Spectator`/`Hooks`→`onPlayerDeath`, `Rewards`→`onGameEnd`)
7. **CFG walk** → `flow.branch` / `flow.forEachPlayer` / `flow.delay` nested emission
8. **`php -l`** every generated PHP file — each file logged as OK/FAIL (hard fail)
9. **Smoke tests** — DbDGame architecture files, plugin.yml, manifest, MatchFlow hooks (hard fail; SkyWars checks module + MatchClockTask)
10. **PHPStan** optional soft pass when binary is available
11. **ZIP** artifact

Every step is written to the build `logs[]` (`info` / `warn` / `error`) and shown in the UI **Compile log** / Builds → **Logs**.

## Generated architecture (DbDGame parity)

Every compiled plugin mirrors `/plugins/DbDGame` layout:

```
src/{Namespace}/
  Loader.php                 # PluginBase entry + getInstance()
  {GameType}.php             # thin GameType facade + GameContext
  contract/GameContext.php
  config/Config.php, ConfigKeys.php
  service/GameServiceRegistry.php
  match/MatchState.php, MatchBootstrap.php, MatchTicker.php,
        MatchTeardown.php, MatchFlow.php   # blueprint hooks live in MatchFlow
  modules/                   # domain modules (e.g. modules/skywars/)
  listeners/                 # MiniGameBaseReadySubscriber, EventListeners
  tasks/BaseArenaTask.php    # (+ MatchClockTask for SkyWars)
  ui/HudPresenter.php
resources/config.yml, lang/
plugin.yml
blueprint-manifest.json      # architecture: "DbDGame"
```

Facade lifecycle: `MatchBootstrap` → `MatchFlow` (graphs) on start; `MatchFlow` → `MatchTeardown` on end.

## CLI

```bash
php compiler/bin/compile.php templates/EmptyMiniGame ./out/EmptyMiniGame
php compiler/bin/compile.php templates/SkyWars ./out/SkyWars
php compiler/bin/compile.php templates/DeadByDaylight ./out/DbDBlueprint
```

## Backend

`POST /api/projects/{id}/builds` → Messenger `CompileProjectMessage` (default **sync**) → ZIP under `backend/var/builds/`.  
`DELETE /api/builds/{id}` removes build row + artifact (UI confirms via modal).

To compile asynchronously via Redis:

1. Set `MESSENGER_TRANSPORT_DSN=redis://127.0.0.1:6380/messages`
2. Route `CompileProjectMessage` to `async` in `config/packages/messenger.yaml`
3. Run `php bin/console messenger:consume async -vv`
