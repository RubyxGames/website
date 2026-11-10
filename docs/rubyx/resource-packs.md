---
title: Resource packs
outline: deep
description: Стеки, CDN, шифрование и hot-reload ресурс-паков — RubyxGames.
---

# Resource packs

## Форматы

- `.zip` / `.mcpack`
- Папка с `manifest.json` (сжимается в `compress_cache_dir`)

Исходники в `resource_packs/` **не** перезаписываются.

## Стеки

`resource_stack` — глобальный стек по умолчанию.

**Стеки миров** (`world_stacks.<папка>`): при логине отдаётся стек **default world**, если настроен; иначе глобальный. Плагины: `ResourcePackManager::getResourceStackForWorld()` / `getNamedStack()`.

**Важно:** Bedrock **не** меняет resource packs в активной сессии. После `/resourcepacks reload` или transfer игроку нужен **реконнект**.

## CDN (#10)

```yaml
cdn_urls:
  <pack-uuid-или-имя-файла>: "https://cdn.example.com/pack.zip"
```

URL уходят в `ResourcePacksInfoPacket`. Локальные копии оставляйте для fallback chunk-download. Плагины: `PlayerResourcePackOfferEvent::setCdnUrls()`.

## Кэш клиента (#11)

Нет кастомного binary-diff. Клиент **не** качает заново, если **UUID + version** совпали.

- Кэш сжатия folder/zip сбрасывается при изменении stamp файлов.
- При reload сервер логирует смену fingerprint `uuid|version|sha256`.
- Мелкие правки текстур: поднимите **version** в `manifest.json`, UUID можно оставить.

`ResourcePackManager::getPackContentFingerprint(ResourcePack)` → `uuid|version|sha256hex`.

## Шифрование (#13)

- Файл `<pack>.key` рядом с паком (**ровно 32 байта**), или:
  ```yaml
  resource_stack:
    - pack: secret.zip
      key_file: secret.zip.key
  ```
- Успешная загрузка зашифрованного пака логируется.
- Если `.key` есть, а пак не грузится — warning в лог.

## Hot-reload (#14)

```text
/resourcepacks reload
```

Право: `pocketmine.command.resourcepacks`. Перечитывает YAML и паки; онлайн-игроки обновятся только после реконнекта.

## Отдача чанками

`pack_chunk_size_kb` и `pack_chunk_concurrency` — размер и параллелизм потоковой отдачи пакета клиенту.

Capability: `folder-packs`.
