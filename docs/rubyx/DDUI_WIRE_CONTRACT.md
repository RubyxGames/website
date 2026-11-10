# DDUI wire contract (Bedrock 1.26.60)

## Screen resolution

Vanilla DDUI screens ship in the Bedrock client (not in server resource packs). The server references them by **string screen id** in `ClientboundDataDrivenUIShowScreenPacket`.

| Screen | `screenId` | Root data-store property (server) |
|--------|------------|-----------------------------------|
| Message box (two-button dialog) | `minecraft:message_box` | `message_box_data` |
| Custom form (DDUI) | `minecraft:custom_form` | `custom_form_data` |
| MineChat PostSystem (RP) | `minechat:postsystem_chat` | `postsystem_chat_data` |

**Data store namespace** = substring before `:` in `screenId` (e.g. `minecraft` for `minecraft:message_box`).

### Per-instance property names (protocol ≥ 1.26.20)

Client property becomes `{root}_{formId}` (e.g. `message_box_data_3`). Older protocols use the un-suffixed root property only.

### `dataInstanceId`

For protocol ≥ `PROTOCOL_1_26_20`, set `dataInstanceId` on ShowScreen to the same value as `formId` (matches Nukkit-MOT and BDS-aligned captures).

## Packet order (open)

1. `ClientboundDataStorePacket` with one **`DataStoreChange`**: full initial object tree for the screen property.
2. `ClientboundDataDrivenUIShowScreenPacket` with `screenId`, `formId`, optional `dataInstanceId`.

## Packet order (server close)

1. `ClientboundDataDrivenUICloseScreenPacket` with `formId` (≥ 1.26.10).

## Client → server

| Packet | When |
|--------|------|
| `ServerboundDataStorePacket` (`DataStoreUpdate`) | Control interaction (e.g. `button1.onClick`, writable fields on CustomForm) |
| `ServerboundDataDrivenScreenClosedPacket` | Screen dismissed (`formId`, `closeReason` string) |

Minimum protocol: data-store serverbound useful from ~1.21.130+; **screen-closed** serverbound from **1.26.10+**. Rubyx target **1.26.60** satisfies both.

## Message box initial payload (MVP)

Object shape (cereal `DynamicValueMap`), aligned with Nukkit-MOT `MessageBox`:

```text
{
  "title": string,
  "body": string,
  "button1": { "label": string, "onClick": long, optional "tooltip": string },
  "button2": { "label": string, "onClick": long, optional "tooltip": string }
}
```

`onClick` is client-writable; initial value `0`. Server treats an update with path suffix `button1.onClick` or `button2.onClick` as button 1 / 2.

## Manual verification checklist

1. Client **1.26.60**, no custom DDUI resource pack required for vanilla screens.
2. Join rubyx-server; trigger pilot (DbDGame debug menu → “DDUI test”) or plugin call to `Player::sendDduiForm()`.
3. Expect: title/body + two buttons; tap button → callback; dismiss → close reason handled.
4. If screen is blank: capture whether ShowScreen arrived without prior DataStoreChange (ordering bug) or unknown `screenId` (client too old).

## Custom form initial payload

Root object (`custom_form_data_{formId}`):

```text
{
  "title": string,
  "layout": {
    "0": { /* flat slot properties — no "label"/"button" wrapper key */ },
    "1": { ... },
    "length": long
  },
  "closeButton"?: { "label", "onClick", "button_visible", "visible", "disabled" }
}
```

Each layout index is a **flat** property bag (Nukkit-MOT `ObjectProperty.toChangeValue()`), e.g. label slot `"0"`: `text`, `visible`, `disabled`, `label_visible`; button slot: `label`, `onClick`, `tooltip?`, `button_visible`; spacer: `spacer_visible`; divider: `divider_visible`.

Dropdown `items.{i}` may include `label`, `description`, `value` (selection uses root `value` long, not necessarily list index).

Reactive updates: server **`DataStoreUpdate`** on paths such as `layout.0.text`, `layout.2.disabled` (see `DduiClientUpdates` + `Player::pushDduiClientUpdates()`).

## Blockers

- **Custom layouts** (Ore UI / `.dbd` HUD) are not DDUI screen definitions; they stay JSON UI / HUD.
- Experimental Script API docs may differ slightly from stable client; validate on 1.26.60 before expanding builders.

## References

- Mojang packet doc: [ClientboundDataDrivenUIShowScreenPacket (1.26.60)](https://mojang.github.io/bedrock-protocol-docs/1.26.60/packets/clientbound-data-driven-uishow-screen-packet/)
- Script API UX model: [Introduction to Data-Driven UI (DDUI)](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/intro-to-ddui?view=minecraft-bedrock-stable) (`CustomForm`, `MessageBox`, Observable pattern — wire truth remains Nukkit/BDS captures)
- Nukkit-MOT reference implementation: `MessageBox.getIdentifier()` → `minecraft:message_box`
- Implementation: `src/form/ddui/DduiMessageBoxForm.php`, `DduiLayoutBuilder.php`, `DduiCustomFormReactiveDemo.php`
