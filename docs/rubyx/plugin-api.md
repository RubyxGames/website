# Plugin API

## Folder plugins

Core loads directory plugins (`plugin.yml` + `src/`) via `FolderPluginLoader`. DevTools is **not** required to run folder plugins; keep DevTools only for packaging (`makeplugin` / extract).

## Forms (#45)

Core FormAPI builders (capability `form-api`):

```php
use pocketmine\form\SimpleForm;
use pocketmine\form\ModalForm;
use pocketmine\form\CustomForm;

$form = new SimpleForm(function(Player $player, mixed $data) : void{
	// $data is button index or null if closed
});
$form->setTitle("Hi")->setContent("Pick one")->addButton("OK");
$form->send($player);
```

Also: `ModalForm`, `CustomForm` (`addInput` / `addToggle` / `addSlider` / `addDropdown` / `addLabel` / `addStepSlider`).

MiniGameBase form classes remain for existing plugins; new code should prefer `pocketmine\form\*`.

Manual check: open/close each form type, invalid responses should log `FormValidationException` without crashing.

## Plugin data version (#50)

Opt-in schema versioning (capability `plugin-data-version`):

```yaml
# plugin.yml
data-version: 2
```

Or override `PluginBase::getPreferredDataVersion()` / `migrateData(int $from, int $to)`.
Stored in `plugin_data/<Plugin>/data-version`. `0` (default) disables the check.

## Player data XUID (#47)

Authenticated saves dual-write `players/<name>.dat` and `players/xuid/<xuid>.dat`.
Load prefers the XUID file, then falls back to the name file (capability `xuid-playerdata`).

## Unknown items (#49)

Unrecognized item types become `UnknownItem` and keep original `SavedItemData` through save (capability `unknown-item`). Network may still show info_update. Unknown **block** palettes are preserved via `UnknownBlockStateStore` (capability `unknown-block`).

## Camera (#43)

Capability `camera-instruction`. Shake / fade / clear, presets / set / FOV / target, плюс aim-assist / spline / attach:

```php
use pocketmine\color\Color;
use pocketmine\network\mcpe\protocol\CameraShakePacket;
use pocketmine\network\mcpe\protocol\types\camera\CameraPreset;
use pocketmine\network\mcpe\protocol\types\camera\CameraSetInstruction;
use pocketmine\network\mcpe\protocol\types\camera\CameraSplineInstruction;

$player->shakeCamera(0.5, 2.0);
$player->stopCameraShake();
$player->fadeCamera(0.5, 1.0, 0.5); // black
$player->clearCamera();

$player->sendCameraPresets(/* CameraPreset ... */);
$player->setCamera($setInstruction);
$player->setCameraFov($fovInstruction);
$player->setCameraTarget($targetInstruction); // or remove: setCameraTarget(null, true);

$player->setCameraSpline($splineInstruction);
$player->attachCameraToEntity($actorUniqueId);
$player->detachCameraFromEntity();
$player->sendCameraAimAssistPresets($categories, $presets);
$player->sendCameraAimAssist($presetId, $viewAngle, $distance, $targetMode, $actionType);
```

Fade times are seconds.

## Movement guard (#44 lite)

Capability `movement-guard`. Config `player.movement.*` in `pocketmine.yml` (max blocks per move / per tick, `send-prediction-correction`). Violations rubberband via `MODE_RESET` and optionally `CorrectPlayerMovePredictionPacket`. Not full server-auth physics.

## Unknown blocks (#49)

Unrecognized blockstates keep original `BlockStateData` in `UnknownBlockStateStore` for LevelDB palette round-trip (capability `unknown-block`). Network may still show as unknown / info_update visually.

## Datapacks recipes + item tags (#57 lite)

Capability `datapacks`. Place PM-format recipe JSON under `datapacks/<name>/recipes/` or `worlds/<world>/datapacks/<name>/recipes/` (same shapes as bedrock-data recipes). Item tags: `…/tags/items/*.json`. Loot (PM-native, not Java): `…/loot_tables/*.json` → `DatapackLootRegistry::roll($name)`. Optional `pack.mcmeta` is logged. Not vanilla Java advancements/predicates.

## Core modules

- `multiworld-module` — `/world` (`/mw`) + gamerules (see `docs/multiworld.md`)
- `worldedit` — in-core WorldEdit (`//` commands; `src/world/worldedit`)

## Server capabilities

Prefer declaring what you need instead of probing internals:

```yaml
# plugin.yml
requires-capabilities:
  - folder-packs
  - form-api
```

```php
$server->getCapabilities()->has("nethernet");
$server->getCapabilities()->getAll();
```

Built-in ids include: `folder-plugins`, `folder-packs`, `nethernet`, `session-record`, `adaptive-qos`, `world-clone`, `multiworld-commands`, `form-api`, `plugin-data-version`, `xuid-playerdata`, `unknown-item`, `tick-freeze`, `prometheus-metrics`, `camera-instruction`, `unknown-block`, `movement-guard`, `datapacks`, `plugin-security-scan`.

Missing required capabilities prevent the plugin from loading (logged as a load error).

## Soft reload

`/plugin reload <name>` (alias `/plm`) calls `PluginManager::reloadPlugin()`: disable then enable the **same instance**.

This does **not** reload PHP classes from disk. Use it for config/state reset. Source changes still need a server restart (or a rebuilt `.phar`).

Dependents must be disabled first or reload fails with a clear error.

## Install from URL

`/plugin install <https-url>` downloads a `.phar` or a zip (root `plugin.yml` + `src/`) into `plugins/`. The plugin is **not** loaded until restart.

```yaml
plugins:
  install:
    enabled: true
    max-mb: 32
```

HTTPS only; no marketplace, signing, or auto-update in this release.

## Public vs internal

Treat documented `pocketmine\` APIs (events, commands, worlds, players, forms, schedulers, plugin APIs above) as the supported surface.

Unstable / avoid depending on:

- `pocketmine\network\mcpe` packet internals
- `pocketmine\data` serializers (except documented SavedItemData round-trip via UnknownItem)
- generated lang factories / Yml property enums unless you accept breakage
- anything marked `@internal`

Use capabilities and public managers instead of `class_exists` on core internals.

**PHPStan for plugins:** include repo-root [`phpstan-plugin-baseline.neon`](https://github.com/RubyxGames/PocketMine-MP/blob/stable/phpstan-plugin-baseline.neon) from the plugin's `phpstan.neon`. It documents banned internal namespaces (`network\mcpe\protocol` internals, converters, handlers). A hard composer package split is **wontfix**.
