---
title: Плагины — folder, reload, install
outline: deep
description: Папочные плагины, /plugin reload и /plugin install в ядре RubyxGames.
---

# Плагины: folder, reload, install

## Папочные плагины (#28)

Ядро грузит плагины из **папки** без DevTools:

```text
plugins/MyPlugin/
  plugin.yml
  src/...
```

**DevTools** по-прежнему нужен для `makeplugin` и сборки `.phar`. Capability: `folder-plugins`.

## Мягкий reload (#29)

```text
/plugin reload <имя>
```

Псевдоним `/plm`. Право: `pocketmine.command.plugin`.

**Делает:** `disable` → `enable` **того же экземпляра** (сброс состояния, если плагин это поддерживает в `onDisable` / `onEnable`).

**Не делает:** не перечитывает PHP с диска — после правки кода нужен **restart** (или новый `.phar`). Зависимые плагины должны быть выключены, иначе reload завершится ошибкой.

## Установка по URL (#27)

```text
/plugin install https://example.com/MyPlugin.phar
```

Также: zip с `plugin.yml` и `src/` в корне. Только **HTTPS**. Лимит:

```yaml
plugins:
  install:
    enabled: true
    max-mb: 32
```

После загрузки ядро может **сразу load+enable** без полного рестарта (см. changelog 1.0.0). Нет marketplace, подписей и автообновлений.

## Сканирование безопасности (#40)

```yaml
plugins:
  security-scan: true
  security-scan-mode: warn   # warn | fail
```

Перед загрузкой проверяются `.php` (в том числе внутри `.phar` / `.zip`) на опасные вызовы: `eval`, `shell_exec`, `proc_open`, `create_function`, `preg_replace /e` и т.д. Режим `fail` блокирует плагин. Это **не** песочница процесса — в проде смотрите `resources/php.ini.recommended` и `disable_functions`. Capability: `plugin-security-scan`.

## Связанные страницы

- [Сервис и метрики](/docs/rubyx/ops) — health, drain, tick freeze
- [Plugin API](/docs/rubyx/plugin-api) — capabilities в `plugin.yml`
- [Справочник ядра](/docs/rubyx/core-updates) — полный список фич
