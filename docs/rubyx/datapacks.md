---
title: Datapacks (рецепты и теги)
outline: deep
description: Папочные datapack в RubyxGames — crafting recipes и item tags, не Java datapacks.
---

# Datapacks (рецепты и теги)

**Зачем:** добавлять рецепты и теги предметов без пересборки phar bedrock-data.

## Глобальные паки

```text
datapacks/
  my_pack/
    pack.mcmeta          # опционально
    recipes/
      shapeless_crafting.json
      shaped_crafting.json
      potion_type.json
      ...
    tags/
      items/
        my_tag.json
```

JSON — **формат PocketMine / bedrock-data** (`CraftingManagerFromDataHelper`), **не** vanilla Java datapack. При старте паки мержатся; ошибки одного пакета логируются, сервер **не** падает.

Capability: `datapacks`.

**Нет:** loot tables (кроме отдельного PM loot API), advancements, Java-совместимость.

## Datapacks у мира

Дополнительно к `datapacks/`:

```text
worlds/<имя_мира>/datapacks/<пак>/
  recipes/...
  tags/items/...
```

Удобно для карт арен с уникальными рецептами.

## Loot tables (PM)

Поддержка loot через:

```text
datapacks/<pack>/loot_tables/*.json
```

→ `DatapackLootRegistry::roll()`. См. [Plugin API](/docs/rubyx/plugin-api).

## Экспорт Anvil (legacy)

Команда `/world export-anvil <src> <dest>` — lossy-экспорт для legacy Anvil; не Java 1.13+ palette.

## См. также

- [Мультимиры](/docs/rubyx/multiworld) — `/world`, клоны арен
- [Справочник ядра](/docs/rubyx/core-updates) — capabilities и ограничения
