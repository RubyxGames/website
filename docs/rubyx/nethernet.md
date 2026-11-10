# NetherNet setup (Axolotl / Rubyx)

NetherNet is the WebRTC transport Minecraft: Bedrock uses instead of RakNet (RakNet removed on clients from 1.26.60 / v26.60).

## Requirements

1. PHP binary with `ext-webrtc` from [axolotl-pm/PHP-Binaries](https://github.com/axolotl-pm/PHP-Binaries).
2. `transport.name` in `pocketmine.yml` includes `nethernet` (default template: `nethernet,raknet`).
3. Open firewall / port-forward:
   - **TCP** signaling port (`server-port` from `server.properties`, or `transport.nethernet.builtin-signaling.port`)
   - **UDP** ICE media ports (`transport.nethernet.port-range`, or ephemeral if empty)
   - LAN discovery uses **UDP 7551** when builtin signaling is enabled

If `ext-webrtc` is missing, the server logs that NetherNet was skipped and continues with other transports (e.g. RakNet).

## Identity key

`transport.nethernet.key-file` (default `nethernet.key`) is created on first start.

- **Back it up.** Changing or deleting it makes returning players confirm trust again (TOFU).
- Permissions should stay `0600`.

## STUN / TURN

Default template includes a public STUN server for basic NAT traversal.

- STUN is often enough for home / light NAT.
- Symmetric NAT / CGNAT / some mobile networks need a **TURN** server (`type: turn` with username/password).
- Do not enable `ice-udp-mux` together with TURN.

## TLS and reverse proxy

Plain HTTP signaling triggers a client trust dialog on first join. The server no longer emits a boot NOTICE for plain HTTP (debug only; silent when `reverse-proxy.enabled`).

For production:

1. Put Caddy/Nginx/Cloudflare in front of the signaling TCP port with a valid certificate, **or** set `transport.nethernet.builtin-signaling.tls.certificate` / `key`.
2. If using a reverse proxy, set `reverse-proxy.enabled: true`, the forwarded IP header, and `trusted-ips`.

## Dual transport migration

Default `transport.name` is **`nethernet` only**. Set `name: nethernet,raknet` while older clients or tooling still need RakNet. Query has a dedicated UDP path when RakNet is off.

## Transfer between servers

`Player::transfer($host, $port)` still sends a Bedrock `TransferPacket`.

For NetherNet destinations, `$host` / `$port` should target the **signaling** endpoint of the destination (TCP), matching how the client joins that server. Full seamless WebRTC handoff beyond host:port is not covered here.

## Related config

See the `transport:` section in `resources/pocketmine.yml` and your live `pocketmine.yml`.
