# DDUI implementation status

Target: Bedrock **1.26.60**, PocketMine fork `rubyx-server`.

| Phase | Scope | Status |
|-------|--------|--------|
| 0–1 | Baseline, network audit | Done — `DDUI_BASELINE.md`, `AXOLOTL_NETWORK_AUDIT.md` |
| 2 | Wire contract + manual smoke | Contract done; smoke checklist in `DDUI_MANUAL_SMOKE.md` (client sign-off pending) |
| 3 | MVP + hardening | MessageBox, session manager, handlers, replace delay, timeouts, rate limits, PHPUnit slice |
| 4 | Plugin API | Builder (spacer/divider/closeButton), `DduiFormOnOpen`, reactive demo, `pushDduiClientUpdates`, events, config |
| 5 | DbDGame form migration | **Out of scope** (HUD / auth stay JSON UI per product decision) |

## Protocol tiers

`DduiSupport::protocolTier()` / `Player::getDduiProtocolTier()` — see `plugin-api-ddui.md`. Core session manager picks `dataInstanceId` and `CloseScreen` per client protocol.

## Theme API (phase 1)

`DduiThemeRegistry`, `DduiLayoutBuilder::applyThemePreset()`, `/ddui` theme demo — see `docs/DDUI_THEMING.md`.

## Not planned (MVP+)

- Generic CustomForm → legacy JSON fallback for arbitrary `DduiForm` (only MessageBox has ModalForm fallback; плагины при необходимости используют JSON UI)
- DDUI-native hub as sole `/ddui` launcher (SimpleForm picker kept — hub layout experimental)
- Binary packet encode/decode round-trip in core PHPUnit (no `pmmp/encoding` in server autoload)

## Entry points

- Command: `/ddui` (`DduiTestMenu` — JSON SimpleForm launcher)
- Docs: `plugin-api-ddui.md`, `DDUI_WIRE_CONTRACT.md`
