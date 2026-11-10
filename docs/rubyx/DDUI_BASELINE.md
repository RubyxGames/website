# DDUI baseline (rubyx-server)

Captured: 2026-11-09 (plan phase 0).

## Repository

| Field | Value |
|--------|--------|
| HEAD | `4c23965eac4bb3d0cf21f95a1ac96f6975de0b06` |
| origin | `https://github.com/norachchan/rubyx-server.git` |
| upstream | `https://github.com/axolotl-pm/PocketMine-MP.git` |
| Merge policy | Feature work lands on `rubyx-server` first; upstream Axolotl used for selective porting of PM core fixes, not as a build-from-source gate. |

## Runtime

| Field | Value |
|--------|--------|
| PHP (host CLI) | 8.3.36 |
| `composer.json` PHP constraint | `^8.1` |
| Bedrock protocol (`ProtocolInfo::CURRENT_PROTOCOL`) | `2225` (`PROTOCOL_1_26_60`) |
| `nethergamesmc/bedrock-protocol` (composer.lock) | `dev-master` @ `1790db82e9f859b65a5caeb7cf9ec6596a83cea7` |
| `nethergamesmc/bedrock-data` | `dev-master` |
| Axolotl pins | `axolotl-pm/*+bedrock-1.26.60` |

## DDUI protocol surface (vendor)

Registered in `vendor/nethergamesmc/bedrock-protocol/src/PacketPool.php` (IDs from `protocol_info.json` @ 1.26.60):

| Packet | ID (hex) |
|--------|-----------|
| `ClientboundDataStorePacket` | 0x14a (330) |
| `ServerboundDataStorePacket` | 0x14c (332) |
| `ClientboundDataDrivenUIShowScreenPacket` | 0x14d (333) |
| `ClientboundDataDrivenUICloseScreenPacket` | 0x14e (334) |
| `ClientboundDataDrivenUIReloadPacket` | 0x14f (335) |
| `ServerboundDataDrivenScreenClosedPacket` | 0x157 (343) |

Core `src/` had **no** DDUI handlers before this integration track.

## Quality gates (pre-DDUI patches)

| Tool | Result |
|------|--------|
| PHPUnit | `./vendor/bin/phpunit --bootstrap vendor/autoload.php tests/phpunit` → 213 tests, **52 errors** (missing `ext-yaml`, `PalettedBlockArray` in this CI-like host — environment gaps, not DDUI-related) |
| PHPStan | `2.1.46` (`phpstan.neon.dist` present) |
| Root `phpunit.xml` | **none** (suite invoked via bootstrap path above; DbDGame has its own `plugins/DbDGame/phpunit.xml.dist`) |

## Smoke join

Manual: Docker service `rubyx-server`, client **Bedrock 1.26.60** — out of scope for automated capture here; baseline assumes existing production smoke is green.

## Notes for downstream work

- Lock `nethergamesmc/bedrock-protocol` commit in PR descriptions when touching packet encode/decode.
- DDUI MVP targets protocol ≥ `PROTOCOL_1_26_0`; screen-close serverbound requires ≥ `PROTOCOL_1_26_10` (satisfied on 1.26.60).
