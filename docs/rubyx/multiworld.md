# Multiworld

Built-in MultiWorld module (ported from CzechPMDevs MultiWorld into core). Portal linking is left to plugins.

Capability: `multiworld-module` (+ `multiworld-commands`, `world-clone`).

## Commands

Permission: `pocketmine.command.world` (ops by default).

Aliases: `/mw`, `/multiworld`

| Subcommand | Usage | Description |
|---|---|---|
| `list` | `/world list` | Vertical list of all world folders: Loaded/Unloaded, player count, disk size |
| `create` | `/world create <name> [seed] [generator]` | Generate a new world (`normal`, `flat`, `nether`, `void`, `skyblock`) |
| `delete` | `/world delete <name>` | Unload (if needed), move players to default, delete folder |
| `rename` | `/world rename <from> <to>` | Rename folder + LevelName (world must be empty of players) |
| `load` | `/world load <name>` | Load a world folder |
| `unload` | `/world unload <name>` | Unload a non-default world |
| `tp` | `/world tp <world> [player]` | Teleport to world safe spawn (loads if needed) |
| `clone` / `duplicate` | `/world clone <src> [dest]` | Safe LevelDB copy via `WorldCloner` |
| `info` | `/world info [name]` | Generator, seed, players, spawn |
| `update` | `/world update spawn\|lobby\|default ...` | Set spawn / hub / default world |
| `manage` | `/world manage` | In-game FormAPI UI |
| `help` | `/world help [page]` | Paginated MultiWorld-style help (`/mw help <page>`) |

### `/gamerule`

Permission: `pocketmine.command.gamerule`

```
/gamerule list
/gamerule <rule> <jsonValue> [world]
```

Examples: `/gamerule keepInventory true`, `/gamerule pvp false arena`.

**Enforced server-side:** `keepInventory`, `doTileDrops`, `naturalRegeneration`, `pvp`, `tntExplodes`.  
Other listed rules are stored in world NBT (`GameRules` compound) for compatibility.

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
$wm->cloneWorld("template", "match_1");
$wm->deleteWorld("old_arena");
$wm->renameWorld("tmp", "arena");

use pocketmine\world\multiworld\MultiWorldModule;
MultiWorldModule::resolveGenerator("void"); // GeneratorManagerEntry|null

use pocketmine\world\multiworld\gamerule\WorldGameRules;
$rules = WorldGameRules::for($world);
$rules->set("keepInventory", true)->save($world);
```

## Configuring worlds

Default world name comes from `server.properties` (`level-name`). Additional worlds are folders under `worlds/`.

## Notes

- Plugin `plugins/MultiWorld` was moved to `plugins_backup/MultiWorld` after core integration.
- Core registers `skyblock` (lobby / DbD) and lite `ender` (`ender_mw` / `end` aliases). `normal_mw` aliases core `normal` (custom MultiWorld NormalGenerator not ported). Plugin void-overwrite was **not** ported.
- `/world clone` requires an empty source (no players) for LevelDB safety.
