# DDUI Theming (phase 1)

Three UI layers on Rubyx — do not mix them:

| Layer | Use for | Customization |
|-------|---------|---------------|
| **JSON UI + RP** (`server_form.json`, …) | Сложные layout (HUD, чат) | Полный layout; не DDUI |
| **DDUI Ore UI** (`minecraft:custom_form`) | Reactive menus, polls | `ddui/styling/*.json`, root `styleId` only (panel/labels/fields) |
| **JSON fallback** | Old clients / MessageBox | ModalForm |

Продуктовые плагины с богатым JSON UI остаются на **ModalForm + resource pack**. DDUI-темы — для `/ddui`, новых плагинов и простых реактивных форм.

## What Bedrock allows (DDUI)

- Admin **presets** in `pocketmine.yml` → wire `styleId` on CustomForm root.
- RP **`/ddui/styling/*.json`** (`minecraft:ui-style`, format `beta`) — panel, label colour, textfield images.
- **Not supported:** two-column PostSystem layout, toggle/button styling via RP (as of 1.26.60), reshaping Ore HTML.

See also: [DDUI styling gist (1.26.60)](https://gist.github.com/theaddonn/b28c71e65b6585910c6a8d58a019a4d4).

## Server config (`pocketmine.yml`)

```yaml
ddui:
  default-theme: rubyx:classic
  themes:
    rubyx:classic:
      style-id: ""                    # Ore default
    rubyx:custom:
      style-id: rubyx:custom
```

- **`style-id` empty** — omit `styleId` on the wire (vanilla Ore look).
- On boot and `/resourcepacks reload`, the server scans **`resource_stack`** packs for `ddui/styling/*.json` and logs missing presets.

## Resource pack style file

Path: `ddui/styling/<any>.json`

```json
{
  "format_version": "beta",
  "minecraft:ui-style": {
    "description": { "identifier": "rubyx:custom" },
    "components": {
      "minecraft:form_panel": { "image": "textures/post_ui/panel.png", "padding": [8, 8, 8, 8] },
      "minecraft:form_label": { "color": "#e6d6b0", "shadow": false },
      "minecraft:form_textfield": {
        "text_color": [240, 240, 240],
        "caret_color": "#ffcc44",
        "selection_background_color": "#4a6a9a99",
        "text_color_disabled": "#888888",
        "default_image": "textures/post_ui/input.png",
        "hovered_image": "textures/post_ui/input_hover.png",
        "focused_image": "textures/post_ui/input_hover.png",
        "disabled_image": "textures/post_ui/input.png"
      }
    }
  }
}
```

Textures need `.png` paths and optional `textures/.../*.json` nineslice metadata.

Файл кладётся в resource pack участника стека: `ddui/styling/<name>.json`.

## Plugin API

```php
use pocketmine\form\ddui\DduiBuiltCustomForm;
use pocketmine\form\ddui\DduiThemeRegistry;

$alias = $player->getDduiThemeAlias(); // default from yml

$form = DduiBuiltCustomForm::create("Shop")
    ->applyThemePreset($alias)
    ->addLabel("Items")
    ->addButton("Buy")
    ->onClose(/* ... */);
$player->sendDduiForm($form->build());
```

Or on the builder:

```php
(new DduiLayoutBuilder())
    ->applyThemePreset('rubyx:postsystem')
    ->addLabel('Hello')
    ->buildCustomFormRoot('Title');
```

Registry:

```php
DduiThemeRegistry::resolveStyleId('rubyx:custom');
DduiThemeRegistry::getDiscoveredStyles();
DduiThemeRegistry::getPresets();
```

## In-game test

`/ddui` → **DDUI theme presets** — switches presets and lists discovered RP styles.

## Roadmap (later phases)

- Per-player theme preference (DB / permission).
- Per-slot `styleId` on layout elements when wire is stable.
- MiniGameBase `FormManager::sendDduiForm(..., theme: 'rubyx:dark')`.
- Custom DDUI **screenId** from RP (not `minecraft:custom_form`) — separate project.
