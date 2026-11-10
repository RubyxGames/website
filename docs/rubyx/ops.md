---
title: Сервис, health и метрики
outline: deep
description: Abuse limits, healthcheck, drain, метрики Prometheus и сохранения миров — RubyxGames.
---

# Сервис, health и метрики

Инструменты эксплуатации и безопасности для продакшена (Docker/K8s).

## Abuse limits (#39)

Мягкие лимиты чата и команд (дроп + предупреждение; **без kick**). Лимиты пакетов — отдельно.

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

Консоль не лимитируется. Предупреждения не чаще ~2 с; дальше — debug в лог сессии.

## Crash dump scrubbing (#42)

В отчётах о крашах при `auto-report.send-settings` возможна утечка настроек; секреты редактируются:

- `rcon.password` и похожие ключи в `server.properties` / `pocketmine.yml`
- строки в `phpinfo`
- argv с токенами

В проде лучше `auto-report.send-phpinfo: false`.

## Healthcheck (#51)

Пока сервер работает (не в drain), раз в секунду пишется `health.status` в data-dir:

```text
ok <tick> <unix_ts>
```

При shutdown/drain: `stopping <unix_ts>`.

Docker: `HEALTHCHECK` через `/usr/local/bin/docker-healthcheck.sh`.  
K8s probe:

```yaml
exec:
  command: ["/usr/local/bin/docker-healthcheck.sh", "/data/health.status", "15"]
```

Файл должен быть свежее 15 с и начинаться с `ok `.

## Graceful drain (#54)

```yaml
shutdown:
  drain-seconds: 10   # 0 = сразу остановить tick loop (как раньше)
```

SIGTERM / `/stop`:

1. Drain, `stopping` в health, сообщение игрокам
2. Новые логины отклоняются
3. Тики до нуля игроков или дедлайна
4. `forceShutdown()` — kick, save, unload

Старт/конец drain логируются с числом игроков.

## Логи (#53)

- rate-limit чата/команд — одно предупреждение на окно, дальше debug
- drain — явные строки start/finish
- шум disconnect — в `PrefixedLogger` сессии

## Надёжная запись (#48 lite)

```yaml
world:
  save:
    fsync: true          # fsync перед rename для level.dat / player.dat / конфигов
    region-fsync: false  # fsync Anvil/McRegion при close
```

`Filesystem::safeFilePutContents`: temp → fflush (+ fsync) → rename. Списки банов — тем же путём. LevelDB: опционально `db/LAST_FLUSH` при `world.save.leveldb-sidecar` (см. ниже).

## Tick freeze (#59)

```text
/tick freeze|unfreeze|step [n]|query
```

Право: `pocketmine.command.tick`. При freeze пропускаются тики мира и scheduler плагинов; сеть, консоль, health, drain и метрики работают. `step N` — N тиков и снова freeze. Capability: `tick-freeze`.

## Prometheus (#52)

```yaml
metrics:
  enabled: false
  file: true
  bind: ""   # например 127.0.0.1:9090 для GET /metrics
```

При `file: true` — `metrics.prom` каждую секунду (TPS, load, игроки, память, freeze, чанки/сущности по мирам). `bind` — HTTP scrape. Capability: `prometheus-metrics`.

Гистограммы: `pmmp_tick_duration_seconds`, `pmmp_world_tick_duration_seconds`, `pmmp_world_leveldb_flush_age_seconds` при LAST_FLUSH. В `health.status` может быть `flush_age_s:world=N`.

## LevelDB LAST_FLUSH

- `world.save.leveldb-sidecar` — после batch записи чанков обновляется `db/LAST_FLUSH` (JSON `{unix,tick,chunk_x,chunk_z}`).
- Это **не** WAL и **не** восстановление после краша — только мониторинг.
- WAL на платформе — **wontfix**.

## Movement guard (#44 lite)

```yaml
player:
  movement:
    enabled: true
    max-blocks-per-move: 15
    max-blocks-per-tick: 10.0
    send-prediction-correction: true
```

Rubberband (`MODE_RESET`) + опционально `CorrectPlayerMovePredictionPacket`. Capability: `movement-guard`. Не полноценный anticheat.

## Освещение (#17 lite)

```yaml
world:
  light:
    defer-updates: true   # coalesce до конца тика; false — сразу
```

Population света — async (`LightPopulationTask`) с соседними чанками 3×3. Счётчики defer vs immediate — в Prometheus.

## Сканер плагинов

См. [Плагины: folder, reload, install](/docs/rubyx/plugins-ops#сканирование-безопасности-40).

## Связанные страницы

- [Плагины (folder, reload)](/docs/rubyx/plugins-ops)
- [NetherNet](/docs/rubyx/nethernet)
- [Session recording](/docs/rubyx/session-recording)
