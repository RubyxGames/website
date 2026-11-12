---
title: RubyxGames — документация ядра
outline: deep
description: "Все страницы по RubyxGames PocketMine-MP: API, DDUI, сеть, эксплуатация."
---

# RubyxGames — документация ядра

Здесь — **все** материалы, специфичные для форка RubyxGames. Общая установка, FAQ и базовая разработка плагинов — в [/docs/](/docs/).

## Начало

| Страница | О чём |
|----------|--------|
| [Установка с релиза](/docs/rubyx/installation) | GitHub Releases, phar, прод |
| [Справочник изменений ядра](/docs/rubyx/core-updates) | Возможности ядра, capabilities, DDUI |
| [Changelog 1.0.0](https://github.com/RubyxGames/PocketMine-MP/blob/stable/changelogs/1.0.0.md) | Полный список изменений релиза |

## API для плагинов

| Страница | О чём |
|----------|--------|
| [Plugin API](/docs/rubyx/plugin-api) | Forms, camera, movement-guard, datapacks, capabilities |
| [DDUI plugin API](/docs/rubyx/plugin-api-ddui) | `sendDduiForm`, reactive push, tiers |

## Эксплуатация

| Страница | О чём |
|----------|--------|
| [Сервис и метрики](/docs/rubyx/ops) | Health, drain, Prometheus, tick freeze |
| [NetherNet](/docs/rubyx/nethernet) | WebRTC, TLS, порты, ключи |
| [Мультимиры](/docs/rubyx/multiworld) | `/world`, clone, `/spawn`, gamerule |
| [WorldEdit](/docs/rubyx/worldedit) | `//` команды, schematic |
| [Resource packs](/docs/rubyx/resource-packs) | Стеки, CDN, шифрование, reload |
| [Плагины (folder, reload)](/docs/rubyx/plugins-ops) | Папки, `/plugin reload`, install |
| [Datapacks](/docs/rubyx/datapacks) | Рецепты и item tags на диске |
| [Adaptive QoS](/docs/rubyx/adaptive-qos) | View distance по ping |
| [Session recording](/docs/rubyx/session-recording) | JSONL для разбора инцидентов |

## DDUI (Bedrock 1.26+)

| Страница | О чём |
|----------|--------|
| [Статус внедрения](/docs/rubyx/DDUI_IMPLEMENTATION_STATUS) | Фазы, границы MVP |
| [Wire contract](/docs/rubyx/DDUI_WIRE_CONTRACT) | Пакеты, screenId, data store |
| [Theming](/docs/rubyx/DDUI_THEMING) | `ddui/styling`, presets |
| [Manual smoke](/docs/rubyx/DDUI_MANUAL_SMOKE) | Чеклист на клиенте |
| [Baseline](/docs/rubyx/DDUI_BASELINE) | Версии, протокол, PHPUnit |

## Внутренности

| Страница | О чём |
|----------|--------|
| [Сетевой аудит](/docs/rubyx/AXOLOTL_NETWORK_AUDIT) | Сравнение с Axolotl (для ядерщиков) |

::: tip Базовая документация PMMP
[Установка](/docs/installation), [плагины](/docs/plugins), [NetherNet (общее)](/docs/installation/nethernet-usage), [разработка плагинов](/docs/developers/plugin-docs-index).
:::

::: tip Blueprint
Визуальная IDE мини-игр: [раздел Blueprint](/docs/blueprint/) · [полная документация](/docs/blueprint/guide).
:::
