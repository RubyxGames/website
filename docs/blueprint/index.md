---
title: RUBYX Blueprint
outline: deep
description: "Визуальная IDE мини-игр Bedrock на MiniGameBase — документация раздела Blueprint."
---

# RUBYX Blueprint

Визуальный редактор графов для мини-игр **Minecraft Bedrock** на рантайме **MiniGameBase**.  
Источник истины — пакет `.rbxblueprint`; PHP-плагин — артефакт компиляции под ядро RubyxGames / PocketMine 5.

```
Vue-редактор → API → Compiler → ZIP-плагин → Build Agent → plugins/
```

## Страницы раздела

| Страница | О чём |
|----------|--------|
| [Полная документация](./guide) | UI, графы, хуки, Fn.*, сборка, API, анти-паттерны |
| [Каталог узлов](./nodes) | Пины и полный список `gt.*` / `mg.*` / `eco.*` / … |
| [Шаблоны](./templates) | Empty, SkyWars, Bedwars, DbD и NG scaffolds |
| [Компилятор](./compiler) | Пайплайн IR → PHP, layout как DbDGame |
| [Архитектура](./architecture) | Стек monorepo, auth, async builds |
| [Формат `.rbxblueprint`](./format) | project.json, графы, resources |
| [Vs Unreal Engine](./ue-gap) | Gap-анализ: Function UX, debug, macros |

## С чего начать

1. Поднять IDE (см. [быстрый старт](./guide#2-быстрый-старт)).
2. Создать проект из шаблона или **Мастера новой игры**.
3. Собрать `gt.onGameStart` → `player.sendMessage`.
4. **Проверить** → **Собрать** → при необходимости пуш на test-сервер.

## MiniGameBase <span id="minigamebase"></span>

Сгенерированные плагины зависят от `MiniGameBase` (`depend: [MiniGameBase]`).  
Регистрация `GameType` — только после `MiniGameBaseReadyEvent`. Командный режим (Bedwars-like) идёт через узлы `mg.startTeamMatch` / `mg.openItemShop` и модуль **teamgame**.

::: tip Связь с ядром
Плагины рассчитаны на [RubyxGames PocketMine-MP](/docs/rubyx/). Установка ядра: [релизы GitHub](/docs/rubyx/installation).
:::
