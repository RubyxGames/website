---
title: Мультимиры
outline: deep
description: Встроенный модуль MultiWorld в ядре RubyxGames — команды /world, gamerule, клонирование арен.
---

# Мультимиры

В ядре встроен модуль **MultiWorld** (на базе CzechPMDevs MultiWorld). Телепорты между «порталами» по-прежнему делают плагины.

**Capabilities:** `multiworld-module`, `multiworld-commands`, `world-clone`.

Связанные темы:

- [WorldEdit в ядре](/docs/rubyx/worldedit) — постройка и schematic
- [Plugin API](/docs/rubyx/plugin-api) — `WorldManager::cloneWorld` и capabilities

## Команды

Право по умолчанию у операторов: `pocketmine.command.world`.

Псевдонимы: `/mw`, `/multiworld`

| Подкоманда | Пример | Описание |
|------------|--------|----------|
| `list` | `/world list` | Список миров: загружен / выгружен, игроки, размер на диске |
| `create` | `/world create <имя> [seed] [генератор]` | Новый мир: `normal`, `flat`, `nether`, `void`, `skyblock` |
| `delete` | `/world delete <имя>` | Выгрузка при необходимости, игроки в default, удаление папки |
| `rename` | `/world rename <откуда> <куда>` | Переименование папки (в мире не должно быть игроков) |
| `load` | `/world load <имя>` | Загрузить мир с диска |
| `unload` | `/world unload <имя>` | Выгрузить мир (не default) |
| `tp` | `/world tp <мир> [игрок]` | Телепорт на safe spawn (при необходимости загрузит мир) |
| `clone` / `duplicate` | `/world clone <источник> [копия]` | Безопасная копия LevelDB через `WorldCloner` |
| `info` | `/world info [имя]` | Генератор, seed, игроки, spawn |
| `update` | `/world update spawn\|lobby\|default …` | Spawn, хаб, default world |
| `manage` | `/world manage` | Меню в игре (FormAPI) |
| `help` | `/world help [страница]` | Справка по страницам (`/mw help 2`) |

### `/gamerule`

Право: `pocketmine.command.gamerule`

```text
/gamerule list
/gamerule <правило> <jsonValue> [мир]
```

Примеры: `/gamerule keepInventory true`, `/gamerule pvp false arena`.

**На сервере реально применяются:** `keepInventory`, `doTileDrops`, `naturalRegeneration`, `pvp`, `tntExplodes`.  
Остальные правила сохраняются в NBT мира (`GameRules`) для совместимости с клиентом.

### `/spawn`

Телепорт на **безопасный spawn мира по умолчанию** (не кровать, не точка spawn текущего мира).

| Команда | Право |
|---------|--------|
| `/spawn` | `pocketmine.command.spawn.self` |
| `/spawn <игрок>` | `pocketmine.command.spawn.other` |

## API (`WorldManager`)

```php
$wm = $server->getWorldManager();

$wm->isWorldLoaded("arena");
$wm->isWorldGenerated("arena");
$wm->getWorldFolderNames();
$wm->getWorldPath("arena");
$wm->loadWorld("arena");
$wm->unloadWorld($world);
$wm->generateWorld("arena", WorldCreationOptions::create()->setSeed(1)->setGeneratorClass(Normal::class));
$wm->cloneWorld("template", "match_1"); // источник без игроков
$wm->deleteWorld("old_arena");
$wm->renameWorld("tmp", "arena");

use pocketmine\world\multiworld\MultiWorldModule;
MultiWorldModule::resolveGenerator("void"); // GeneratorManagerEntry|null

use pocketmine\world\multiworld\gamerule\WorldGameRules;
$rules = WorldGameRules::for($world);
$rules->set("keepInventory", true)->save($world);
```

Типичный сценарий мини-игры: шаблон `template` (пустой или выгруженный) → `cloneWorld` на каждый матч.

## Выгрузка чанков (экономия RAM)

```yaml
# pocketmine.yml
chunk-ticking:
  unload:
    enabled: true
    max-chunks-per-tick: 16
    idle-ticks: 200   # ~10 с при 20 TPS
```

Чанки со зрителями и spawn не выгружаются. Агрессивнее unload → меньше RAM, но дольше подгрузка при возврате.

## Генераторы

- В ядре зарегистрированы **`skyblock`** (лобби / DbD) и облегчённый **`ender`**.
- **`void`** — пустая арена без ванильного террейна.
- Плагин `plugins/MultiWorld` перенесён в `plugins_backup/MultiWorld` — используйте встроенный модуль.
- `/world clone` требует **пустой источник** (нет игроков) из соображений безопасности LevelDB.

## Настройка

Имя мира по умолчанию — `level-name` в `server.properties`. Остальные миры — папки в `worlds/`.
