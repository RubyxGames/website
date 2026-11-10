---
title: Установка RubyxGames (релизы)
---

# Установка и обновление RubyxGames

Базовые требования PHP, портов и ручной установки — в разделе Axolotl: [Installation & Updating](/docs/installation) (тот же класс серверного ПО).

Артефакты **RubyxGames** публикуются в [GitHub Releases](https://github.com/RubyxGames/PocketMine-MP/releases).

## Что скачивать

| Файл | Назначение |
|------|------------|
| `PocketMine-MP.phar` | Ядро |
| `start.sh` / `start.cmd` / `start.ps1` | Запуск |
| `build_info.json` | Версия и commit сборки |
| `core-permissions.rst` | Встроенные permissions |

## Linux

1. PHP 8.2+ с расширениями PMMP; для NetherNet — бинарник с `ext-webrtc` (см. [NetherNet Usage](/docs/installation/nethernet-usage) и [Rubyx nethernet](/docs/rubyx/nethernet)).
2. Data path с `plugins/`, `worlds/`, `pocketmine.yml`.
3. `bash start.sh` или `php PocketMine-MP.phar`.

## Обновление

1. Остановка сервера ([ops / drain](/docs/rubyx/ops)).
2. Замена phar и скриптов из нового релиза.
3. Чтение [changelog 1.0.0](https://github.com/RubyxGames/PocketMine-MP/blob/stable/changelogs/1.0.0.md).

Продакшен RubyxNet: см. [ops](/docs/rubyx/ops) и [core-updates](/docs/rubyx/core-updates).
