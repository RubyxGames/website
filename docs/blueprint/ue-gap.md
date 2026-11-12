---
title: Blueprint vs Unreal Engine
outline: deep
description: "Gap-анализ Unreal Engine Blueprints и RUBYX Blueprint: что уже есть и чего не хватает."
---

# Gap-анализ: Unreal Engine Blueprints → RUBYX Blueprint

Сравнение по **рабочим паттернам** UE (Event Graph / Functions / Macros / Variables / Debugging), а не по 1:1 копированию Unreal.  
Цель RUBYX — графы → PHP MiniGameBase, не игровой движок с PIE.

Связано: [обзор](./) · [полная документация](./guide)

---

## 1. Карта понятий

| Unreal Blueprint | RUBYX сейчас | Статус |
|------------------|--------------|--------|
| Event Graph | Hook-графы (`GameType`, `Lobby`, …) + `gt.*` / `ev.*` / `pm.*` | Есть |
| Custom Event | Отдельные event-узлы; **нет** пользовательских `ev.MyThing` | Частично (#18) |
| Function | Графы `fn.*` + `fn.call` | Есть (без return/locals/pure) |
| Macro / Macro Library | Сниппеты (insert once) | Частично — нет переиспользуемого macro-ассета |
| Collapse Nodes / Collapse to Function | `meta.group` рамка; **нет** collapse/parentNode | Слабо (#3 collapse) |
| Construction Script | Нет аналога (editor-time setup графа) | Нет (низкий приоритет для PMMP) |
| Blueprint Interface | Контракт хуков между модулями | Нет |
| Timeline | `flow.delay` / `task.onTick` / schedule | Частично — нет curve/keyframes |
| Components / Actor refs | Arena / Player / World пины | Доменно иначе — ок |
| Level Blueprint | MatchFlow / проектный scope | Ок как модель |
| Blueprint Function Library | Пакеты узлов / shared Fn | Частично (#19–21) |

---

## 2. Уже близко к UE (можно считать закрытым)

| UE-паттерн | Реализация |
|------------|------------|
| Drag-and-drop nodes, exec + data wires | Vue Flow editor |
| Context-sensitive add (ПКМ, библиотека) | NodeLibrary + context menu |
| Search on canvas | Ctrl+F (#1) |
| Comments / sticky notes | `meta.comment` (#2) |
| Align / tidy | Выровнять (#8) |
| Copy/paste selection | clipboard в `editorStore` |
| Snippets ≈ paste macros | Insert snippet (#20 lite) |
| Compile-time validation | Validate + nodeMarks (#28) |
| Preview generated code | preview-hook / Edit code (#23) |
| Minimap | Vue Flow MiniMap (настройка) |
| Hotkey overlay | ? / панель (#6) |
| Variables panel | Project variables + `var.get/set` |
| Forms / branching UX | `form.*` с dynamic exec pins |

---

## 3. Чего не хватает сильнее всего (как в UE)

Приоритет с точки зрения **ежедневного UX автора режима**, не полноты Unreal.

### P0 — ядро «как в Blueprint Editor»

| # | Gap (UE) | Зачем нам | Связь с IDEAS |
|---|----------|-----------|----------------|
| **U1** | **Collapse selection → Function / subgraph** | Выделил цепочку → `fn.X` с входами/выходами, без ручного копирования | #3 + #7 + #19 |
| **U2** | **Local variables внутри Fn** | `L_player`, кэш результата без длинных wire | нет в IDEAS → добавить |
| **U3** | **Return node + типизированные outs у Fn** | `fn.call` возвращает Player/int/bool, не только side-effects | расширить #19 |
| **U4** | **Promote pin → Variable** | ПКМ на data-пин → создать `var` / local нужного типа | нет → добавить |
| **U5** | **Reroute nodes** | Чистые провода на больших Match/WinCheck графах | нет → добавить |
| **U6** | **Строгая совместимость пинов + Cast** | Сейчас типы мягкие; UE ломает несовместимые связи и даёт Cast To | частично validator |

### P1 — отладка как в UE (без полного PIE)

| # | Gap (UE) | Зачем нам | Связь |
|---|----------|-----------|--------|
| **U7** | **Breakpoints на узлах** | Пометить узел → при симуляции/логе остановиться / подсветить | #25 |
| **U8** | **Watch values** | Видеть значения пинов на шаге | #25 |
| **U9** | **Execution trace / call stack** | «onGameStart → branch → fn.GiveKit» | #24 + #25 |
| **U10** | **Лог рантайма в IDE** | Аналог Output Log после push | #26 |

Полноценный PIE Unreal **не копируем**: вместо этого — step-симулятор матча + server log (#25–26).

### P2 — переиспользование и контракты

| # | Gap (UE) | Зачем нам | Связь |
|---|----------|-----------|--------|
| **U11** | **Macro Library** (expand-in-place, multi exec in/out) | Сниппеты сейчас one-shot; macro обновляется во всех местах при смене | #20 усилить |
| **U12** | **Blueprint Interfaces** | Общий контракт: «любой режим имеет `prepareLoadout(Player)`» | #18 рядом |
| **U13** | **Custom Events** с параметрами | `ev.MyThing(Player, int)` между модулями | #18 |
| **U14** | **Pure functions** (без exec) | Getters / math / format без засорения потока | data.* частично; Fn pure — нет |
| **U15** | **Node versioning / deprecated** | Как UE warning на устаревших нодах | #22 |

### P3 — UX-полировка «из коробки UE»

| # | Gap | Зачем | Связь |
|---|-----|-------|--------|
| **U16** | Collapse / expand **групп** (parentNode) | Рамка `meta.group` есть, свернуть — нет | WAVE4 «дальше» |
| **U17** | Named history / bookmarks | Не только undo stack | #5 |
| **U18** | Timeline / curve editor | Плавные фазы матча | #16 border/clock рядом; низкий ROI |
| **U19** | Construction Script | Preview арены в редакторе | #31–32; не блокер |
| **U20** | Inheritance / parent Blueprint | «Bedwars extends TeamGame» | шаблоны + overrides; отдельный тип ассета — позже |
| **U21** | Tutorial / First-run tips на узлах | Onboarding | #41–43 |

---

## 4. Чего **не** стоит тащить из UE

| UE-фича | Почему не приоритет |
|---------|---------------------|
| Actor Components, meshes, physics | Нет 3D-сцены; домен = PHP + арена |
| Soft/hard object references, asset GC | Другая модель загрузки |
| Multicast / replication nodes | Сервер авторитетен на PMMP |
| Latent action VM Unreal | У нас `scheduleDelayed` / tick — достаточно |
| PIE / Simulate in Editor 1:1 | Дорого; хватит симулятора хуков + log |
| Blueprint nativization | Мы уже «нативизируем» в PHP при compile |

---

## 5. Рекомендуемый порядок волн

### WAVE5 — «UE Function UX» (максимум отдачи)

1. **Collapse to Fn** (U1) + автопины из selection  
2. **Fn returns + local vars** (U2–U3)  
3. **Promote to variable** (U4)  
4. **Reroute** (U5)  
5. Жёстче **pin type check** + простой `cast.*` (U6)

### WAVE6 — «Debug lite»

1. Симулятор хука step-by-step (#25 / U7–U9)  
2. Подсветка «этот узел → метод PHP» (#24)  
3. Server log в Builds (#26 / U10)

### WAVE7 — «Reuse & contracts»

1. Macro library (U11)  
2. Custom events (U13 / #18)  
3. Node deprecation (U15 / #22)  
4. Collapse groups parentNode (U16)

---

## 6. Краткий вердикт

RUBYX уже закрыл **базовый Event Graph + compile + templates** лучше, чем «просто node editor».  
До ощущения «как Unreal Blueprint» больше всего не хватает не новых игровых узлов, а **Function workflow** (collapse / locals / returns / promote) и **отладки потока** (trace / watches / breakpoints-lite).

Игровой домен (зоны enter/leave, vote, border, PHP import) остаётся в [IDEAS.md](./), но UE-сравнение сдвигает фокус следующей волны с «ещё mg.*» на **редактор функций и дебаг**.
