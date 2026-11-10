# Plugin API — DDUI (experimental)

## In-game test menu

Операторы с `pocketmine.command.ddui`: **`/ddui`** — меню (JSON SimpleForm) с тестовыми DDUI-экранами: контролы, reactive demo, **NPC dialog** (`DduiNpcDialogForm`).

## Feature detection

```php
use pocketmine\form\ddui\DduiSupport;

if ($player->supportsDdui()) {
    // protocol >= 1.26.0 and pocketmine.yml ddui.enabled
}
$player->getDduiProtocolTier(); // full | with_screen_close | base | unsupported
$player->supportsDduiDataInstanceId(); // PROTOCOL_1_26_20+
$player->supportsDduiScreenClosed();   // PROTOCOL_1_26_10+
```

Protocol tiers (server adapts wire automatically via `DduiNetworkAdapter` / `DduiSessionManager`):

| Tier | Min protocol | Client gets |
|------|----------------|-------------|
| `unsupported` | &lt; 1.26.0 | Use JSON forms / ModalForm |
| `base` | 1.26.0 | Open + DataStore push |
| `with_screen_close` | 1.26.10 | + `CloseScreen` packet |
| `full` | 1.26.20 | + per-form `dataInstanceId` |

Disable DDUI: `pocketmine.yml` → `ddui.enabled: false`, or runtime `DduiSupport::$forceDisable = true`.

### Config (`pocketmine.yml`)

| Key | Default | Meaning |
|-----|---------|---------|
| `ddui.enabled` | true | Master switch |
| `ddui.replace-delay-ticks` | 20 | Delay before show after replacing another DDUI screen |
| `ddui.session-timeout-ticks` | 6000 | Server-side session expiry (0 = off) |
| `ddui.max-inbound-updates-per-tick` | 32 | Rate limit for `ServerboundDataStore` |
| `ddui.max-outbound-updates-per-tick` | 64 | Rate limit for server `ClientboundDataStore` updates |

### Events

- `pocketmine\event\player\DduiFormCloseEvent` — screen closed or timeout (cancellable before `handleClose`)
- `pocketmine\event\player\DduiFormClientUpdateEvent` — client DataStore update (cancellable before form handler)
- `pocketmine\event\player\DduiFormResponseEvent` — user outcome (e.g. MessageBox button); cancellable before callable

### MiniGameBase

`FormManager::sendDduiForm($player, $form, $forceOpen)` — same cooldown / single-open guards as `sendForm`.

## Message box

```php
use pocketmine\form\ddui\DduiMessageBoxForm;

$form = new DduiMessageBoxForm(
    "Confirm",
    "Delete this entry?",
    "Delete",
    "Cancel",
    function (\pocketmine\player\Player $p, ?bool $choice): void {
        // true = button1, false = button2, null = dismissed
    }
);
$player->sendDduiForm($form);
```

On unsupported clients, `DduiMessageBoxForm` automatically falls back to core `ModalForm` JSON.

## Custom DDUI screens

Implement `pocketmine\form\ddui\DduiForm` and call `$player->sendDduiForm($form)`. Only `DduiMessageBoxForm` has ModalForm fallback today.

Fluent CustomForm:

```php
use pocketmine\form\ddui\DduiBuiltCustomForm;

$form = DduiBuiltCustomForm::create("Shop")
    ->addLabel("Pick an item")
    ->addSpacer()
    ->addButton("Buy")
    ->withCloseButton()
    ->onClose(function (\pocketmine\player\Player $p, \pocketmine\form\ddui\DduiSession $s, ?string $reason): void {
        // ...
    });
$player->sendDduiForm($form);
```

Reactive updates (push property changes to the open screen):

```php
use pocketmine\form\ddui\DduiClientUpdates;

$session = $player->getNetworkSession()->getDduiSessionManager()->getActiveSession();
if ($session !== null) {
    $player->pushDduiClientUpdates([
        DduiClientUpdates::setString($session, "body", "Updated text"),
    ]);
}
```

Path helpers: `DduiPathParser` (MessageBox buttons, CustomForm button slots, `closeButton.onClick`).

Optional **`DduiFormOnOpen`** — repeating tasks / subscriptions after the screen opens (see `DduiCustomFormReactiveDemo`).

Wire contract: `docs/DDUI_WIRE_CONTRACT.md`.

### Themes (phase 1)

Presets in `pocketmine.yml` (`ddui.default-theme`, `ddui.themes`), styles from RP `ddui/styling/*.json`. See **`docs/DDUI_THEMING.md`**.

```php
$player->getDduiThemeAlias();
$player->resolveDduiStyleId('rubyx:postsystem');

DduiBuiltCustomForm::create("Title")->applyThemePreset($player->getDduiThemeAlias())->addLabel("…");
```

Test in-game: `/ddui` → **DDUI theme presets**.

Status overview: `docs/DDUI_IMPLEMENTATION_STATUS.md`.
