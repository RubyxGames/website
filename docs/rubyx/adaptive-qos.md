---
title: Adaptive QoS
outline: deep
description: Снижение view distance при высоком ping — RubyxGames PocketMine-MP.
---

# Adaptive QoS

При высоком сглаженном (EWMA) ping сервер временно **уменьшает дальность прорисовки** игрока — меньше чанков и сущностей в сети, меньше rubberband на слабых каналах.

## Конфиг (`pocketmine.yml`)

```yaml
network:
  adaptive-qos:
    enabled: false
    ping-soft-ms: 150
    ping-hard-ms: 300
    recover-ms: 100
    soft-view-distance: 6
    hard-view-distance: 4
    min-view-distance: 3
    check-interval-ticks: 40
```

| Уровень | Условие | Действие |
|---------|---------|----------|
| soft | ping ≥ `ping-soft-ms` | cap `soft-view-distance` |
| hard | ping ≥ `ping-hard-ms` | cap `hard-view-distance` |

Восстановление с гистерезисом `recover-ms`, чтобы дистанция не дёргалась каждый тик. QoS **никогда** не поднимает дистанцию выше запроса клиента/плагина и лимитов памяти.

## Поведение

1. Клиент запрашивает радиус → сохраняется как желаемая дистанция.
2. QoS может снизить эффективную дистанцию через `Player::applyQosViewDistance()`.
3. При улучшении ping — возврат к желаемому значению.

По умолчанию **выключено**. Включайте после теста на своей аудитории.

Capability: `adaptive-qos`.
