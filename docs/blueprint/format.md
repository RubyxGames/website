---
title: Формат .rbxblueprint
outline: deep
description: "Структура project.json, графов и resources."
---

# Blueprint format (`.rbxblueprint`)

```
project.json
blueprints/*.json
variables/*.json
resources/
meta/
```

## Graph JSON

`nodes[]`, `edges[]`, `viewport`.

Each node: `id`, `typeId` (or `data.typeId`), `position`, `data` (props).

Each edge: `id`, `source`, `target`, `sourceHandle`, `targetHandle`.

IR is produced by the compiler (not raw Vue Flow dump):

```json
{
  "graphs": [{"id": "GameType.onGameStart", "blocks": [], "cfg": []}],
  "symbols": {"variables": [], "functions": []},
  "targets": {"plugin": {}, "gameTypeId": "skywars"}
}
```
