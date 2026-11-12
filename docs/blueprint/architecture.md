---
title: Архитектура Blueprint
outline: deep
description: "Стек, monorepo и контракт сборки."
---

# Architecture

RUBYX Blueprint compiles visual graphs into MiniGameBase plugins.

```
Vue editor → Symfony API → Compiler IR → PHP plugin → ZIP / Build Agent → rubyx-server/plugins
```

Key principle: `.rbxblueprint` is source; PHP is build output.

## Monorepo

| Path | Role |
|------|------|
| `backend/` | Symfony 6.4 API (scaffold from unseenstats) |
| `frontend/` | Vue 3 + TS + Vite + Vue Flow (FSD), MC launcher theme |
| `compiler/` | IR → PocketMine plugin generator (CFG + data-flow) |
| `integrations/MiniGameBase/` | Node catalog + api-schema |
| `templates/` | EmptyMiniGame, SkyWars, DeadByDaylight (`dbd`) |
| `build-agent/` | Signed ZIP install into `plugins/` (default `:9091`) |
| `shared/schemas/` | JSON Schema for project/graph |

## Compile contract

Generated plugins mirror **DbDGame** modular layout: `Loader` + thin `{GameType}` facade (`GameContext`), `match/` (MatchState / Bootstrap / Ticker / Teardown / Flow), `service/GameServiceRegistry`, `modules/`, `listeners/`, `tasks/`, `config/`, `ui/`.  
`depend: [MiniGameBase]`; register GameType on `MiniGameBaseReadyEvent`.  
Blueprint graphs emit into `match/MatchFlow`; `Fn.*` → private helpers (`fn.call`).  
Data pins lower via `DataFlow` (e.g. `arena.getAliveCount` → `flow.branch`).

## Auth

- Demo: `X-Demo-User` auto-provisions passwordless user  
- Real: `POST /api/auth/register|login` → Bearer `apiToken`

## Async builds

Default Messenger transport is **sync**. Optional Redis worker: `docker compose --profile async up worker` after routing `CompileProjectMessage` to `async`.
