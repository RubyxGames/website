# Ops: лимиты, health, shutdown

Инструменты эксплуатации и безопасности для продакшена (Docker/K8s).

## Abuse limits (#39)

Soft chat/command rate limits (drop + warn; **no kick**). Packet batch limits remain separate.

```yaml
abuse-limits:
  chat:
    enabled: true
    max-per-second: 2
    burst: 4
  commands:
    enabled: true
    max-per-second: 4
    burst: 8
```

Console commands are not limited. Warnings are throttled (~2s) to avoid log spam; further hits log at debug on the session logger.

## Crash dump scrubbing (#42)

Crash reports still may include settings when `auto-report.send-settings` is on, but secrets are redacted:

- `rcon.password` and other password/secret/token-like keys in `server.properties` / `pocketmine.yml`
- matching lines in `phpinfo`
- argv tokens that look like secrets

Prefer leaving `auto-report.send-phpinfo: false` in production.

## Healthcheck (#51)

While the server is running (not draining), it writes `health.status` in the data directory every second:

```text
ok <tick> <unix_ts>
```

On shutdown/drain start the file becomes `stopping <unix_ts>`.

Docker:

- `Dockerfile` `HEALTHCHECK` runs `/usr/local/bin/docker-healthcheck.sh`
- `docker-compose.yml` uses the same probe on `rubyx-server`

K8s exec probe example:

```yaml
exec:
  command: ["/usr/local/bin/docker-healthcheck.sh", "/data/health.status", "15"]
```

Freshness default: file must be newer than 15 seconds and start with `ok `.

## Graceful drain (#54)

```yaml
shutdown:
  drain-seconds: 10   # 0 = stop tick loop immediately (legacy-like)
```

On SIGTERM / `/stop`:

1. Mark draining, write `stopping` health, broadcast a short message
2. Refuse new logins (`Server is shutting down`)
3. Keep ticking until no players **or** deadline
4. Then complete shutdown → existing `forceShutdown()` (kick remaining, save, unload)

Drain start/end are logged with online player counts.

## Clearer logs (#53)

- Chat/command rate-limit: one warning per window, then session debug
- Drain: explicit start/finish lines with player counts
- Session PrefixedLogger remains the place for per-player disconnect noise

## Durable saves (#48 lite)

```yaml
world:
  save:
    fsync: true          # fsync temp file before rename for level.dat / player.dat / configs
    region-fsync: false  # if true, fsync Anvil/McRegion files on close only
```

`Filesystem::safeFilePutContents` writes a temp file, fflush + optional fsync, then rename. Ban lists use the same path. LevelDB chunk batches optionally update `db/LAST_FLUSH` when `world.save.leveldb-sidecar` is enabled (see below).

## Tick freeze (#59)

```text
/tick freeze|unfreeze|step [n]|query
```

Permission: `pocketmine.command.tick`. While frozen, world + plugin scheduler ticks are skipped; network, console, health, drain, and metrics continue. `step N` runs N game ticks then stays frozen. Capability: `tick-freeze`.

## Prometheus metrics (#52 lite)

```yaml
metrics:
  enabled: false
  file: true
  bind: ""   # e.g. 127.0.0.1:9090 for GET /metrics
```

When enabled with `file: true`, writes `metrics.prom` each second (TPS, load, players, memory, tick counter, freeze flag, per-world chunks/entities/tick-ms). Optional scrape bind serves `GET /metrics`. Capability: `prometheus-metrics`.

## World save durability 

- `world.save.fsync` — fflush+fsync for `Filesystem::safeFilePutContents`.
- `world.save.region-fsync` — region file fsync on close.
- `world.save.leveldb-sidecar` — after each LevelDB chunk write batch, updates `db/LAST_FLUSH` via safe write (JSON `{unix,tick,chunk_x,chunk_z}`; legacy plain unix still readable). Extension has no fsync/WAL API — **WAL is platform wontfix**. Sidecar is forensics/monitoring only (age in Prometheus / `health.status`); it does not replay chunks after a crash.

## Movement guard 

```yaml
player:
  movement:
    enabled: true
    max-blocks-per-move: 15
    max-blocks-per-tick: 10.0
    send-prediction-correction: true
```

Safety rubberband (`MODE_RESET`) plus optional `CorrectPlayerMovePredictionPacket` (capability `movement-guard`). Not full prediction AC.

## Light updates 

```yaml
world:
  light:
    defer-updates: true # coalesce until end of world tick; false = execute immediately
```

Chunk light **population** remains async (`LightPopulationTask`) with loaded 3×3 neighbor terrain. Deferred vs immediate execute counts are exported as Prometheus counters. Full off-thread incremental light is **wontfix** (World races).

## Metrics histograms 

Prometheus exposition includes `pmmp_tick_duration_seconds` and `pmmp_world_tick_duration_seconds` histograms, plus `pmmp_world_leveldb_flush_age_seconds` when LAST_FLUSH exists. `health.status` may include `flush_age_s:world=N`.

## Plugin security scan (#40 lite+)

```yaml
plugins:
  security-scan: true
  security-scan-mode: warn # or fail
```

Scans plugin PHP (folder, `.phar` interior, `.zip` interior) for `eval` / `shell_exec` / `proc_open` / `create_function` / `preg_replace /e` / etc. before load (`assert` only in `fail` mode). Shell backticks are not scanned (false positives on markdown/SQL). Boot NOTICE if dangerous functions remain enabled — see `resources/php.ini.recommended`. **Not a process sandbox**. Capability `plugin-security-scan`.
