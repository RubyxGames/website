---
title: NetherNet
outline: deep
description: WebRTC-транспорт Bedrock, порты, ключи и TLS — RubyxGames PocketMine-MP.
---

# NetherNet (WebRTC)

NetherNet — транспорт Minecraft: Bedrock на **WebRTC** вместо RakNet (на клиентах с 1.26.60 RakNet убран).

Подробнее в общей доке: [NetherNet (установка)](/docs/installation/nethernet-usage). Здесь — эксплуатация на Rubyx.

## Требования

1. PHP с **`ext-webrtc`** ([axolotl-pm/PHP-Binaries](https://github.com/axolotl-pm/PHP-Binaries) или сборка RubyxGames).
2. В `pocketmine.yml` в `transport.name` есть `nethernet` (шаблон: `nethernet` или `nethernet,raknet`).
3. Firewall / проброс портов:
   - **TCP** — signaling (`server-port` из `server.properties` или `transport.nethernet.builtin-signaling.port`)
   - **UDP** — ICE media (`transport.nethernet.port-range` или эфемерные порты)
   - **UDP 7551** — LAN discovery при встроенном signaling

Без `ext-webrtc` сервер пишет, что NetherNet пропущен, и продолжает на других транспортах (например RakNet).

## Ключ идентичности

`transport.nethernet.key-file` (по умолчанию `nethernet.key`) создаётся при первом старте.

- **Сохраните бэкап.** Смена ключа заставит игроков снова подтверждать доверие (TOFU).
- Права на файл: `0600`.

## STUN / TURN

В шаблоне есть публичный STUN для простого NAT.

- STUN часто хватает дома / лёгкого NAT.
- Симметричный NAT, CGNAT, мобильные сети — нужен **TURN** (`type: turn` с логином/паролем).
- Не включайте `ice-udp-mux` вместе с TURN.

## TLS и reverse proxy

Plain HTTP signaling при первом входе вызывает диалог доверия. Boot-**NOTICE** для plain HTTP убран (только debug; тишина при `reverse-proxy.enabled`).

Продакшен:

1. Caddy/Nginx/Cloudflare перед TCP signaling с валидным сертификатом, **или**  
   `transport.nethernet.builtin-signaling.tls.{certificate,key,passphrase}`
2. При reverse proxy: `reverse-proxy.enabled: true`, заголовок forwarded IP, `trusted-ips`.

## Два транспорта (миграция)

По умолчанию `transport.name` — **`nethernet`**. Для старых клиентов: `nethernet,raknet`. Query использует отдельный UDP-путь, когда RakNet выключен.

## Transfer между серверами

`Player::transfer($host, $port)` шлёт Bedrock `TransferPacket`.

Для NetherNet назначение — **signaling** (TCP) целевого сервера, как при обычном join. Полный seamless WebRTC handoff только по host:port здесь не расписан.

## Конфиг

Секция `transport:` в `resources/pocketmine.yml` и вашем `pocketmine.yml`.

Capability: `nethernet`.
