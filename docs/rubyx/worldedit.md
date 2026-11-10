---
title: WorldEdit в ядре
outline: deep
description: Встроенный WorldEdit (бывший EasyEdit) — команды //, schematic, capability worldedit.
---

# WorldEdit в ядре

Бывший плагин **EasyEdit** / **WorldEdit** встроен в RubyxGames. Отдельный `.phar` в `plugins/` не нужен, если вы используете встроенный модуль.

**Capability:** `worldedit`

```yaml
# plugin.yml
requires-capabilities:
  - worldedit
```

## Где лежит код и данные

| Путь | Назначение |
|------|------------|
| `src/world/worldedit/` | Код (`pocketmine\world\worldedit`) |
| `resources/worldedit/` | Строки, репозиторий schematic и т.д. |
| `plugin_data/WorldEdit/` | Данные плагина (при первом старте миграция с `plugin_data/EasyEdit`) |
| `plugins_backup/WorldEdit` | Резервная копия старого плагина (не грузится) |

Права: префикс **`worldedit.*`** (как у оригинального WorldEdit).

## Команды

Игровые команды прежние, с префиксом `//`, например:

- `//wand` — инструмент выделения
- `//set`, `//replace` — заливка блоков
- `//copy`, `//paste` — буфер обмена
- `//undo`, `//redo`
- работа с **schematic** (загрузка / вставка)

Точный список и синтаксис — в справке модуля в игре и в языковых файлах `resources/worldedit/lang/`.

::: warning Совместимость
Не держите **дубликат** WorldEdit в `plugins/` — возможны конфликты команд и прав. Используйте либо ядро, либо внешний плагин, не оба.
:::

## Schematic (кратко)

В ядре есть поддержка **schematic** (плитки и облегчённо — сущности). Пути и форматы смотрите в `resources/worldedit/repo/`.

Для карт DbD / арен: шаблон мира удобнее клонировать через [`/world clone`](/docs/rubyx/multiworld), WorldEdit — для правок и импорта построек.

## Плагинам

Ядро **не** дублирует публичное API WorldEdit для сторонних плагинов целиком. Для мини-игр:

- постройка арены — WorldEdit операторами или schematic;
- runtime матча — PHP-плагин (DbDGame) + [мультимиры](/docs/rubyx/multiworld).

Если плагину нужен только факт «на сервере есть WE» — объявите `requires-capabilities: [worldedit]`.

## См. также

- [Справочник ядра — миры](/docs/rubyx/core-updates) (раздел миров и WorldEdit)
- [Plugin API](/docs/rubyx/plugin-api)
