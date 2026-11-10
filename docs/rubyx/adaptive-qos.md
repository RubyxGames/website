# Adaptive QoS

When a player's smoothed (EWMA) ping is high, the server temporarily lowers their **view distance** so fewer chunks/entities are sent. This is meant to reduce rubberbanding on weak links.

## Config (`pocketmine.yml`)

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

- **soft** tier: ping ≥ `ping-soft-ms` → cap at `soft-view-distance`
- **hard** tier: ping ≥ `ping-hard-ms` → cap at `hard-view-distance`
- Recovery uses `recover-ms` hysteresis so distance does not flap every tick
- Never raises distance above what the client/plugin requested or what memory limits allow

## Behaviour

1. Client requests radius → stored as desired distance.
2. QoS may apply a lower effective distance via `Player::applyQosViewDistance()`.
3. When ping recovers, effective distance returns toward the desired value.

Disabled by default. Enable only after testing on your player base.
