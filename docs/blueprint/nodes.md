---
title: Каталог узлов Blueprint
outline: deep
description: "Пины, категории и полный список узлов RUBYX Blueprint."
---

# Node system

Пины: `exec` | data (`Player`, `Arena`, `string`, `int`, `float`, `bool`, `World`, `GameTypeId`, arrays).

Категории в каталоге: Events, Flow, Player, MiniGameBase, Data, World, UI, Utilities, Meta, SkyWars, Template.

Определения: `integrations/MiniGameBase/nodes/*.json` → `GET /api/nodes`.  
RU-подписи свойств/узлов: `frontend/src/shared/lib/nodeCatalogI18n.ts`.  
Пользовательский обзор: [Полная документация](./guide).

---

## Полный каталог

### Events — GameType (`gt.*`)

| id | Роль |
|----|------|
| `gt.onLobbyStart` | Старт лобби |
| `gt.onGameStart` | Старт матча |
| `gt.onGameEnd` | Конец матча |
| `gt.preparePlayer` | Подготовка игрока |
| `gt.onPlayerJoin` | Вход в арену |
| `gt.onPlayerLeave` | Выход из арены |
| `gt.onPlayerDeath` | Смерть |
| `gt.onPlayerDisconnectedDuringGame` | Дисконнект в матче |
| `gt.onVoteStart` | Голосование |
| `gt.onGameTimeLimitReached` | Лимит времени |

### Events — MiniGameBase (`ev.*`)

| id | Роль |
|----|------|
| `ev.ArenaStart` | Арена стартовала |
| `ev.ArenaGameStarting` | Обратный отсчёт / starting |
| `ev.ArenaEnd` | Арена завершена |
| `ev.PlayerJoinArena` | Игрок зашёл на арену |
| `ev.PlayerLeaveArena` | Игрок вышел |
| `ev.PlayerDeathInArena` | Смерть на арене |
| `ev.VoteStart` | Старт vote |

### Events — PocketMine / прочее

| id | Роль |
|----|------|
| `mg.ready` | `MiniGameBaseReadyEvent` |
| `pm.PlayerJoin` | PlayerJoinEvent |
| `pm.PlayerQuit` | PlayerQuitEvent |
| `pm.PlayerDeath` | PlayerDeathEvent |
| `pm.PlayerInteract` | Клик предметом / блоком |
| `pm.PlayerCommandPreprocess` | Команда игрока (prefix, cancel) |
| `task.onTick` | Повторяющийся тик (period) |

### Flow

| id | Роль |
|----|------|
| `flow.branch` | If / else по bool |
| `flow.sequence` | Несколько exec подряд |
| `flow.forEachPlayer` | Цикл по игрокам арены |
| `flow.delay` | Отложенный exec |
| `flow.doOnce` | Один раз за матч/сессию |
| `fn.call` | Вызов графа `Fn.*` |

### Player

| id | Роль |
|----|------|
| `player.sendMessage` | Сообщение в чат |
| `player.sendTitle` | Title / subtitle |
| `player.clearInventory` | Очистка инвентаря |
| `player.giveItem` | Выдать предмет |
| `player.teleport` | Телепорт |
| `player.setGamemode` | Режим игры |
| `player.setHealth` | Здоровье |
| `player.playSound` | Звук |

### MiniGameBase — арена / лобби / таймеры / спеки

| id | Роль |
|----|------|
| `mg.registerGameType` | Регистрация типа (только Main) |
| `mg.createArena` / `mg.findArenaByGameType` | Арены |
| `mg.addPlayerToArena` / `mg.removePlayerFromArena` | Состав |
| `mg.sendLang` | Локализованное сообщение |
| `mg.scheduleDelayed` / `mg.scheduleRepeating` | Планировщик |
| `arena.broadcast` / `arena.startGame` / `arena.stopGame` | Управление |
| `arena.getPlayers` / `arena.getAliveCount` / `arena.getStatus` | Данные |
| `lobby.prepare` / `lobby.teleport` | Лобби |
| `timer.startLobby` / `timer.startGame` | Таймеры |
| `spectator.enter` / `spectator.leave` | Спектатор |
| `scoreboard.show` | Scoreboard |
| `storage.get` / `storage.inc` / `storage.top` | IDataStorage |

### MiniGameBase — teamgame (`mg.*`)

| id | Роль |
|----|------|
| `mg.startTeamMatch` | Старт командного матча |
| `mg.cancelTeamClock` | Отмена часов |
| `mg.openItemShop` / `mg.openUpgradeShop` | Магазины |
| `mg.onTeamPlayerDeath` / `mg.onTeamGameEnd` | Хуки teamgame |

### Economy / Party / Matchmaking / Forms / Zones

| id | Роль |
|----|------|
| `eco.getBalance` / `eco.addMoney` / `eco.takeMoney` / `eco.hasMoney` | Экономика |
| `party.create` / `party.invite` / `party.leave` | Пати |
| `matchmaking.enqueue` / `matchmaking.dequeue` | Очередь |
| `form.sendSimple` | SimpleForm → `exec_btn_N` + `buttonIndex` |
| `form.sendModal` | ModalForm → yes/no + `buttonIndex` |
| `zone.isInside` | Радиус вокруг точки → Inside/Outside |

### Data / Variables / World / Utilities / Meta

| id | Роль |
|----|------|
| `data.string` / `data.int` / `data.bool` | Литералы |
| `data.compare` / `data.format` | Сравнение / формат |
| `var.get` / `var.set` | Переменные проекта |
| `world.get` | Мир по имени |
| `util.log` / `util.permission` / `util.php` | Лог / права / сырой PHP |
| `meta.comment` / `meta.group` | Только редактор (без PHP) |

### SkyWars (`sw.*`)

| id | Роль |
|----|------|
| `sw.startMatchClock` / `sw.cancelClock` | Match clock |
| `sw.openCages` | Открытие клеток |
| `sw.fillChests` | Заполнение сундуков |
| `sw.giveKit` | Выдача кита |
| `sw.spawnMidEvent` | Mid-event |
| `sw.onPlayerDeath` / `sw.onGameEnd` | Обработчики SW |

---

## Правила компиляции (кратко)

- `exec` строит CFG; data-пины понижаются через `DataFlow`.
- `flow.branch` / `forEachPlayer` / `delay` эмитятся вложенно.
- `fn.call` → private helper из графа `fn.*`.
- `meta.*` игнорируются генератором.
- Hard fail: `mg.registerGameType` вне `Main`, ошибки `php -l`, smoke архитектуры.
