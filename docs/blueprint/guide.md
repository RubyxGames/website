---
title: Blueprint — полная документация
outline: deep
description: "Полное руководство RUBYX Blueprint: графы, узлы, шаблоны, компиляция и MiniGameBase."
---

# RUBYX Blueprint — полная документация

**Назначение:** визуальная IDE для мини-игр Bedrock на **MiniGameBase**.  
Источник истины — пакет `.rbxblueprint`; PHP-плагин — артефакт компиляции.

Связанные страницы: [обзор раздела](./) · [Архитектура](./architecture) · [Компилятор](./compiler) · [Каталог узлов](./nodes) · [Шаблоны](./templates) · [Формат](./format) · [MiniGameBase](./#minigamebase)

---

## Оглавление

1. [Что это и как устроено](#1-что-это-и-как-устроено)
2. [Быстрый старт](#2-быстрый-старт)
3. [Проект: вкладки и настройки](#3-проект-вкладки-и-настройки)
4. [Раздел «Графы»](#4-раздел-графы)
5. [Редактор графа](#5-редактор-графа)
6. [Хуки MatchFlow и Fn.*](#6-хуки-matchflow-и-fn)
7. [Каталог узлов (обзор)](#7-каталог-узлов-обзор)
8. [Переменные, ресурсы, языки, киты](#8-переменные-ресурсы-языки-киты)
9. [Шаблоны и мастер новой игры](#9-шаблоны-и-мастер-новой-игры)
10. [Проверка, превью, сборка, пуш](#10-проверка-превью-сборка-пуш)
11. [Формат `.rbxblueprint`](#11-формат-rbxblueprint)
12. [Контракт сгенерированного плагина](#12-контракт-сгенерированного-плагина)
13. [Интеграция MiniGameBase](#13-интеграция-minigamebase)
14. [Анти-паттерны](#14-анти-паттерны)
15. [Справочник API бэкенда](#15-справочник-api-бэкенда)
16. [Где смотреть дальше](#16-где-смотреть-дальше)

---

## 1. Что это и как устроено

```
Vue-редактор → Symfony API → Compiler IR → PHP-плагин (ZIP)
       → Build Agent → rubyx-server/plugins
```

| Слой | Технологии |
|------|------------|
| Frontend | Vue 3 + TypeScript + Vite + Pinia + Vue Flow (FSD) |
| Backend | Symfony 6.4, PHP 8.3+, PostgreSQL |
| Compiler | IR → PocketMine 5 плагин, layout как DbDGame |
| Runtime | MiniGameBase (`depend: [MiniGameBase]`) |

Графы описывают поведение режима: события → действия → ветки. Компилятор собирает их в `match/MatchFlow.php` и вспомогательные модули.

---

## 2. Быстрый старт

```bash
# Инфра
docker compose up -d db redis

# API (если :8080 занят — :8088)
cd backend && PATH=/usr/bin:/bin composer install
php bin/console doctrine:schema:update --force
php -S 127.0.0.1:8088 -t public public/router.php

# UI
cd frontend && npm install && npm run dev

# Smoke-компиляция шаблона
php compiler/bin/compile.php templates/EmptyMiniGame ./out/EmptyMiniGame
```

В UI:

1. Dashboard → создать проект из шаблона (или **Мастер новой игры**).
2. Вкладка **Графы** → открыть `GameType` / `Main`.
3. Собрать цепочку `gt.onGameStart` → `player.sendMessage`.
4. **Проверить** → **Собрать плагин** → при необходимости пуш через Build Agent.

Авторизация демо: заголовок `X-Demo-User`. Полный логин: `POST /api/auth/register|login` → Bearer `apiToken`.

---

## 3. Проект: вкладки и настройки

| Вкладка | Содержимое |
|---------|------------|
| **Графы** | Хуки, Fn.*, модули кода, превью PHP-хука |
| **Переменные** | Глобальные `variables` проекта (тип + значение) |
| **Ресурсы** | `config.yml`, киты, таблица переводов `lang/*` |
| **Настройки** | plugin.yml identity, arena settings, softdepend |
| **Сборки** | История билдов, логи, скачать ZIP, пуш, удалить |

Экспорт: **Export .rbxblueprint** → ZIP исходников (не скомпилированный плагин).

---

## 4. Раздел «Графы»

Панель проекта (`GraphsPanel`):

- **Поиск** по id / названию / описанию Fn.
- **Фильтры:** Все · Хуки · Функции.
- **Карточки** графов с действиями «Код» и «Граф».
- **Создание:** тип «Граф» или «Функция (Fn.*)»; для функции ключ автоматически получает префикс `fn.`.
- **Превью хука:** выбор `onGameStart` / `onLobbyStart` / … → readonly PHP MatchFlow.
- **Модули:** правки override-файлов (`MatchFlow`, `SkyWarsModule`, …) через Code modal.

Вкладки редактора (`GraphTabs`): поиск + группировка хуков / Fn над холстом.

---

## 5. Редактор графа

### Холст

- Узлы из библиотеки (drag & drop) или ПКМ → Insert snippet / Add comment.
- **Exec**-пины (поток) и **data**-пины (типизированные значения).
- Свойства выбранного узла — панель Properties (в т.ч. ItemPicker для предметов).
- **Edit code** — `customPhp` графа или override узла.
- Комментарии `meta.comment` и рамки `meta.group` **не** генерируют PHP.

### Тулбар

| Действие | Назначение |
|----------|------------|
| Сохранить | Запись графа на API |
| Проверить | Soft validation без ZIP |
| Собрать | Полный compile → build |
| Поиск | Прыжок к узлу по title / typeId |
| Выровнять | Автолейаут узлов |
| Клавиши | Панель подсказок |

### Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `Ctrl/⌘+F` | Поиск по графу |
| `Ctrl/⌘+S` | Сохранить |
| `Ctrl/⌘+Z` | Undo |
| `?` | Подсказка клавиш |
| `Esc` | Закрыть панели / модалки |

### Сниппеты (ПКМ)

- Give kit chain  
- Enter spectator  
- Lobby teleport  
- Kit form menu (SimpleForm + ветки кнопок)

---

## 6. Хуки MatchFlow и Fn.*

### Hook-графы

Имена без префикса `fn.` (например `GameType`, `Lobby`, `WinCheck`).  
Компилятор **сливает** вспомогательные графы в методы фасада:

| Граф (пример) | Метод MatchFlow |
|---------------|-----------------|
| Lobby | `onLobbyStart` |
| Chests / Scoreboard / Generators | `onGameStart` |
| WinCheck / Spectator / Hooks | `onPlayerDeath` |
| Rewards | `onGameEnd` |

Точки входа событий — узлы `gt.*`, `ev.*`, `pm.*`, `mg.ready`, `task.onTick`.

### Функции `Fn.*`

- Id графа: `fn.Heal`, `fn.GiveStarter`, …
- Вызов из другого графа: узел `fn.call` (имя без/с префиксом — нормализуется).
- Описания для библиотеки хранятся в `resources/blueprint/functions.json` (кнопка «Сохранить описания Fn»).

---

## 7. Каталог узлов (обзор)

Полная таблица — [каталог узлов](./nodes). Кратко по семействам:

| Семейство | Примеры | Роль |
|-----------|---------|------|
| `gt.*` | `onGameStart`, `preparePlayer`, `onPlayerDeath` | Хуки GameType |
| `ev.*` | `ArenaStart`, `PlayerJoinArena` | События MiniGameBase |
| `pm.*` | `PlayerJoin`, `PlayerInteract`, `PlayerCommandPreprocess` | События PocketMine |
| `flow.*` | `branch`, `sequence`, `forEachPlayer`, `delay`, `doOnce` | Управление потоком |
| `player.*` | `sendMessage`, `sendTitle`, `teleport`, `giveItem` | Действия с игроком |
| `arena.*` / `lobby.*` / `timer.*` / `spectator.*` | broadcast, startLobby, enter | Арена и матч |
| `mg.*` | `registerGameType`, `sendLang`, `startTeamMatch`, `openItemShop` | MiniGameApi + teamgame |
| `eco.*` | `getBalance`, `addMoney`, `takeMoney`, `hasMoney` | Экономика |
| `form.*` | `sendSimple`, `sendModal` | UI-формы + ветки кнопок / `buttonIndex` |
| `party.*` / `matchmaking.*` | create, invite, enqueue | Пати и очередь |
| `storage.*` / `var.*` / `data.*` | get/inc/top, literals, compare | Данные |
| `sw.*` | `startMatchClock`, `giveKit`, `fillChests` | SkyWars-модуль |
| `zone.isInside` | радиус вокруг точки | Проверка зоны |
| `task.onTick` | период | Тик-задача |
| `meta.*` | comment, group, reroute | Только редактор |
| `util.php` | произвольный PHP | Escape hatch |

---

## 8. Переменные, ресурсы, языки, киты

### Переменные

Ключ → `{ type, value }`. Доступ в графе: `var.get` / `var.set`.  
Рекомендуемые arena settings из Settings проекта попадают в `getRecommendedArenaSettings()`.

### config.yml

Редактируется во вкладке Resources. Секции режима (`skywars:`, `bedwars:` / teamgame, киты, карты) читаются рантаймом MiniGameBase / сгенерированными модулями.

### Киты

Если в YAML есть `*.kits`, UI показывает **KitEditor** с иконками предметов (ItemPicker).

### Переводы

`resources/lang/*.yml` → таблица ключ → locale. В графе: `mg.sendLang` (ключ + плейсхолдеры).

### Override PHP

Файлы вида `code-overrides/match/MatchFlow.php` в resources полностью подменяют сгенерированный файл при merge.

---

## 9. Шаблоны и мастер новой игры

| id | Папка | Назначение |
|----|-------|------------|
| `empty` | EmptyMiniGame | Минимальный Join → Message |
| `skywars` | SkyWars | Полный островной цикл |
| `dbd` | DeadByDaylight | Скелет генераторов / крюков |
| `bedwars` | Bedwars | Командный режим через `mg.*` teamgame |
| `murdermystery`, `thebridge`, `duels`, … | см. TEMPLATES | NG-inspired scaffolds |

**Мастер новой игры** (Dashboard): число игроков, лобби / клетки / киты / команды / кровати / экономика → рекомендуемый `templateId`.

Подробности и smoke-команды: [Шаблоны](./templates).

---

## 10. Проверка, превью, сборка, пуш

### Проверить (validate)

`POST /api/projects/{id}/validate` → errors / warnings / `nodeMarks` на холсте.  
Примеры soft-checks: висячий exec, нет `gt.onGameStart`, `fn.call` на несуществующий Fn.

### Превью хука

`POST /api/projects/{id}/preview-hook` с `{ hook }` → текст метода MatchFlow без ZIP.

### Сборка

`POST /api/projects/{id}/builds` → Messenger (по умолчанию **sync**) → ZIP в `backend/var/builds/`.

Пайплайн компилятора: load → parse → validate → IR → generate → merge graphs → CFG emit → `php -l` → smoke → ZIP.  
Логи видны в UI (Compile log / Builds → Logs).

### CLI

```bash
php compiler/bin/compile.php templates/SkyWars ./out/SkyWars
php compiler/bin/compile.php templates/Bedwars ./out/Bedwars
```

### Build Agent

```bash
php build-agent/bin/agent.php
# POST /install  Bearer + X-Plugin-Name + ZIP body → rubyx-server/plugins
```

Из UI Builds: **Push** / **Download** / **Delete** (с подтверждением).

---

## 11. Формат `.rbxblueprint`

```
project.json
blueprints/*.json      # графы: nodes[], edges[], viewport
variables/*.json
resources/             # config.yml, lang/, code-overrides/, blueprint/functions.json
meta/
```

Узел: `id`, `typeId`, `position`, `data` (props).  
Ребро: `source` / `target` + handles.  
Подробнее: [формат](./format).

---

## 12. Контракт сгенерированного плагина

Архитектура зеркалит DbDGame:

```
src/{Namespace}/
  Loader.php
  {GameType}.php
  contract/GameContext.php
  config/ …
  service/GameServiceRegistry.php
  match/MatchState, MatchBootstrap, MatchTicker, MatchTeardown, MatchFlow
  modules/ …
  listeners/ …
  tasks/ …
  ui/HudPresenter.php
resources/config.yml, lang/
plugin.yml
blueprint-manifest.json   # architecture: "DbDGame"
```

- `depend: [MiniGameBase]`
- Регистрация GameType на `MiniGameBaseReadyEvent` (не в синхронном `onEnable`)
- Жизненный цикл: Bootstrap → MatchFlow (графы) → Teardown

Подробнее: [Компилятор](./compiler) · [Архитектура](./architecture).

---

## 13. Интеграция MiniGameBase

Каталог узлов: `integrations/MiniGameBase/nodes/*.json`  
Схема API: `integrations/MiniGameBase/schema/api-schema.json`  
Манифест версии: `integrations/MiniGameBase/manifest.json`

Публичный рантайм-контракт: см. [MiniGameBase](./#minigamebase) и плагин на сервере.

### Teamgame (`mg.*`)

Универсальный командный режим в MiniGameBase (не отдельный Bedwars-плагин):

| Узел | Назначение |
|------|------------|
| `mg.startTeamMatch` | Старт командного матча / часов |
| `mg.cancelTeamClock` | Отмена часов |
| `mg.openItemShop` / `mg.openUpgradeShop` | Магазины |
| `mg.onTeamPlayerDeath` / `mg.onTeamGameEnd` | Хуки смерти / конца |

При смене API MiniGameBase: обновить schema + nodes, bump manifest, пересобрать шаблоны.

---

## 14. Анти-паттерны

| Не делать | Почему |
|-----------|--------|
| `mg.registerGameType` вне графа `Main` | Компилятор режет как anti-pattern |
| Регистрация GameType в `onEnable` без Ready | Гонка с загрузкой MiniGameBase |
| Тяжёлая логика в `task.onTick` без throttle | Нагрузка на main thread |
| Путать hook-граф и `fn.*` | Fn не становится методом жизненного цикла сама |
| Править только сгенерированный PHP на сервере | Перезапишется следующим билдом — правьте blueprint / overrides |
| Хардкод строк игроку вместо `mg.sendLang` | Ломает мультиязычность |

---

## 15. Справочник API бэкенда

| Метод | Путь | Назначение |
|-------|------|------------|
| GET/POST | `/api/projects` | Список / создать |
| GET/PATCH | `/api/projects/{id}` | Читать / обновить |
| GET | `/api/projects/{id}/export` | Скачать `.rbxblueprint` |
| GET/POST | `/api/projects/{id}/graphs` | Список / создать граф |
| GET/PUT | `/api/projects/{id}/graphs/{graphId}` | Читать / сохранить |
| POST | `/api/projects/{id}/validate` | Проверка без сборки |
| POST | `/api/projects/{id}/preview-hook` | Превью MatchFlow-хука |
| GET/POST | `/api/projects/{id}/builds` | История / старт сборки |
| GET/DELETE | `/api/builds/{id}` | Статус / удалить |
| POST | `/api/builds/{id}/push` | Пуш на Build Agent |
| GET | `/api/nodes` | Каталог узлов |

Auth: `X-Demo-User` или Bearer после `/api/auth/*`.

---

## 16. Где смотреть дальше

| Документ | Тема |
|----------|------|
| [Каталог узлов](./nodes) | Пины, категории, полный список узлов |
| [Шаблоны](./templates) | Шаблоны игр и smoke |
| [Компилятор](./compiler) | Пайплайн и layout PHP |
| [Архитектура](./architecture) | Стек и контракт сборки |
| [Формат](./format) | `.rbxblueprint` |
| [MiniGameBase](./#minigamebase) | Рантайм арены и события |

Обучение: соберите EmptyMiniGame → `mg.ready` → `mg.registerGameType` → `gt.onGameStart` → `player.sendMessage`, затем откройте превью хука и сравните с MatchFlow после Build.
