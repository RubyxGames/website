# Axolotl / rubyx-server network audit — DDUI integration points

Paths are relative to `/root/rubyxnet/rubyx-server`.

## Packet registration

- **Pool**: `vendor/nethergamesmc/bedrock-protocol/src/PacketPool.php`
- **Constants**: `vendor/nethergamesmc/bedrock-protocol/src/ProtocolInfo.php`
- **IDs**: `vendor/nethergamesmc/bedrock-data/protocol_info.json`

DDUI clientbound/serverbound types are already registered; no PacketPool change required for MVP.

## Send path (server → client)

| Concern | Location | Integration |
|---------|----------|-------------|
| Generic send | `src/network/mcpe/NetworkSession.php` → `sendDataPacket()` | **Use as-is** for `ClientboundDataStorePacket`, `ClientboundDataDrivenUIShowScreenPacket`, `ClientboundDataDrivenUICloseScreenPacket` |
| Legacy forms | `NetworkSession::onFormSent()` | `ModalFormRequestPacket` + JSON — unchanged |
| Close legacy | `NetworkSession::onCloseAllForms()` | `ClientboundCloseFormPacket` — unchanged |

**Adapter**: `src/form/ddui/DduiNetworkAdapter.php` builds protocol objects and calls `$session->sendDataPacket()`. Plugins must not send DDUI packets directly.

## Receive path (client → server)

| Packet | Handler | Before MVP |
|--------|---------|------------|
| `ServerboundDataStorePacket` | `InGamePacketHandler::handleServerboundDataStore()` | Default trait → no-op (`return false`) |
| `ServerboundDataDrivenScreenClosedPacket` | `InGamePacketHandler::handleServerboundDataDrivenScreenClosed()` | Default trait → no-op |

**Integration**: Handlers delegate to `DduiSessionManager` on the player's `NetworkSession` (created in `NetworkSession::onPlayerCreated()`).

Reference (forms today):

```975:996:src/network/mcpe/handler/InGamePacketHandler.php
	public function handleModalFormResponse(ModalFormResponsePacket $packet) : bool{
		// ...
	}
```

## Session state

| Component | Role |
|-----------|------|
| `DduiSession` | `formId`, optional `dataInstanceId`, `screenId`, property name, `DduiForm`, lifecycle state |
| `DduiSessionManager` | Per-`NetworkSession` map, form ID allocation, active screen, delayed re-show after replace |

## Lifecycle / cleanup

| Event | Action |
|-------|--------|
| `Player::closeAllForms()` | Close DDUI via `DduiSessionManager::closeAll()` + legacy `onCloseAllForms()` |
| `NetworkSession::tryDisconnect()` | `disposeHooks` + `dispose()` clears `DduiSessionManager` |
| `NetworkSession::transfer()` / `disconnect()` | Same disconnect path; pending DDUI sessions dropped |
| Unexpected serverbound | Log at debug if no matching `formId` / property (mirror `hasPendingForm` for modal) |

## Comparison: ShowScreen wire format

`ClientboundDataDrivenUIShowScreenPacket` (protocol ≥ 1.26.10):

1. `screenId` (string) — e.g. vanilla `minecraft:message_box`
2. `formId` (uint32)
3. `dataInstanceId` (optional uint32, ≥ 1.26.20 typically equals `formId`)

## Risks

- Rapid Show after Close may yield client `USER_BUSY` — `DduiSessionManager` closes then waits `ddui.replace-delay-ticks` (default 20) via `Server::getCorePluginScheduler()`.
- Session watchdog: `NetworkSession::tick()` → `DduiSessionManager::tick()` enforces `ddui.session-timeout-ticks`.
- Upstream `bedrock-protocol` on `dev-master` — record lock commit in `DDUI_BASELINE.md` when merging large protocol changes.
