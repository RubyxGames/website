---
title: RubyxGames — изменения ядра
outline: deep
description: "Документация форка RubyxGames PocketMine-MP — мультипротокол, DDUI, эксплуатация RubyxNet."
---

# RubyxGames — дополнения к базовой документации

Разделы **Getting Started**, **FAQ** и **Developer Resources** в этом сайте основаны на полном тексте документации [Axolotl-PM](https://axolotl-pm.org/docs/) (установка, подключение, плагины, миры, права, типовые проблемы).

Ниже — материалы по **вашим изменениям** в ядре RubyxGames / продакшен RubyxNet.

## Быстрые ссылки

| Тема | Страница |
|------|----------|
| Установка phar с GitHub Releases | [Установка RubyxGames](/docs/rubyx/installation) |
| Сводка изменений ядра | [core-updates](/docs/rubyx/core-updates) |
| Плагин API (Rubyx) | [plugin-api](/docs/rubyx/plugin-api) |
| DDUI для плагинов | [plugin-api-ddui](/docs/rubyx/plugin-api-ddui) |
| Changelog **1.0.0** | [GitHub](https://github.com/RubyxGames/PocketMine-MP/blob/stable/changelogs/1.0.0.md) |
| Чеклист прод-релиза | [prod-release-5.52-checklist](/docs/rubyx/prod-release-5.52-checklist) |

## Эксплуатация

- [ops](/docs/rubyx/ops) — abuse-limits, healthcheck, graceful shutdown
- [nethernet](/docs/rubyx/nethernet) — WebRTC, порты, ключи (Rubyx / Axolotl binary)
- [multiworld](/docs/rubyx/multiworld) — встроенный мультимир
- [resource-packs](/docs/rubyx/resource-packs)
- [adaptive-qos](/docs/rubyx/adaptive-qos)
- [session-recording](/docs/rubyx/session-recording)

## DDUI и MineChat

- [DDUI_IMPLEMENTATION_STATUS](/docs/rubyx/DDUI_IMPLEMENTATION_STATUS)
- [DDUI_WIRE_CONTRACT](/docs/rubyx/DDUI_WIRE_CONTRACT)
- [DDUI_THEMING](/docs/rubyx/DDUI_THEMING)
- [DDUI_MANUAL_SMOKE](/docs/rubyx/DDUI_MANUAL_SMOKE)
- [DDUI_BASELINE](/docs/rubyx/DDUI_BASELINE)
- [MINECHAT_DDUI_POSTSYSTEM_SCREEN](/docs/rubyx/MINECHAT_DDUI_POSTSYSTEM_SCREEN)

## Внутренности (для разработчиков ядра)

- [AXOLOTL_NETWORK_AUDIT](/docs/rubyx/AXOLOTL_NETWORK_AUDIT) — сравнение сетевого стека с Axolotl

::: info Совместимость с Axolotl
RubyxGames наследует NetherNet, multi-protocol и большую часть PMMP API. Там, где поведение совпадает с Axolotl-PM, используйте базовые страницы в `/docs/` (например [NetherNet Usage](/docs/installation/nethernet-usage)).
:::
