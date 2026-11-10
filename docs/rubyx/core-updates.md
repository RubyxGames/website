---
title: Справочник изменений ядра Rubyx
outline: deep
---

# Справочник изменений ядра Rubyx

Справочник возможностей ядра RubyxGames: зачем фича, как устроена, как включить и вызывать.

Тематические гайды (если нужна ещё большая глубина по одной теме):

| Страница | Тема |
|------|------|
| [nethernet](/docs/rubyx/nethernet) | NetherNet / WebRTC |
| [adaptive-qos](/docs/rubyx/adaptive-qos) | Adaptive QoS |
| [session-recording](/docs/rubyx/session-recording) | Запись сессий |
| [resource-packs](/docs/rubyx/resource-packs) | Ресурс-паки |
| [multiworld](/docs/rubyx/multiworld) | Мультимиры |
| [plugin-api](/docs/rubyx/plugin-api) | Плагин-API |
| [ops](/docs/rubyx/ops) | Ops / security / metrics |
| [plugin-api-ddui](/docs/rubyx/plugin-api-ddui) | DDUI plugin API |
| [DDUI_WIRE_CONTRACT](/docs/rubyx/DDUI_WIRE_CONTRACT) | Пакеты / screenId / data store |
| [DDUI_THEMING](/docs/rubyx/DDUI_THEMING) | RP `ddui/styling`, Theme API |
| [Changelog 1.0.0](https://github.com/RubyxGames/PocketMine-MP/blob/stable/changelogs/1.0.0.md) | Релиз |

---

## Capabilities (проверка фич ядра)

### Зачем

Плагины часто делают `class_exists` / reflection по внутренностям ядра. Это ломается при рефакторинге. **Capabilities** — явный контракт: «на этом билде есть фича X».

### Как пользоваться

В `plugin.yml` плагин может потребовать набор id. Если чего-то нет — плагин **не загрузится** (ошибка в логе):

```yaml
requires-capabilities:
  - form-api
  - camera-instruction
  - multiworld-commands
```

В коде:

```php
$caps = $server->getCapabilities();
if($caps->has("nethernet")){
	// можно опираться на NetherNet
}
$all = $caps->getAll(); // list<string>
```

### Зарегистрированные id (сейчас)

`folder-plugins`, `folder-packs`, `nethernet`, `session-record`, `adaptive-qos`, `world-clone`, `multiworld-commands`, `multiworld-module`, `worldedit`, `form-api`, `plugin-data-version`, `xuid-playerdata`, `unknown-item`, `tick-freeze`, `prometheus-metrics`, `camera-instruction`, `unknown-block`, `movement-guard`, `datapacks`, `plugin-security-scan`.

Новые версии ядра регистрируют id при старте сервера в `Server` (register рядом с остальными).

---

## Сеть, протоколы и транспорты

### Multi-version Bedrock

**Зачем.** На одном сервере могут сидеть клиенты разных патчей Bedrock (1.20 … 1.26.60). Без multi-version старые клиенты отваливаются на handshake.

**Как устроено.** Список версий в `ProtocolInfo::ACCEPTED_PROTOCOL`. На старте сессии `SessionStartPacketHandler::isCompatibleProtocol()` решает, пускать ли протокол. Дальше пакеты и чанки кодируются **под протокол конкретного игрока** (TypeConverter / ChunkCache по protocol id).

**Как пользоваться.** Обычно ничего настраивать не нужно — достаточно актуального ядра. Плагины, которые шлют сырые пакеты из `pocketmine\network\mcpe`, сами отвечают за совместимость версий; публичный API Player/World безопаснее.

---

### NetherNet (WebRTC-транспорт)

**Зачем.** С Bedrock 1.26.60 клиенты уходят с чистого RakNet на NetherNet (WebRTC). Ядро умеет держать **оба** транспорта сразу, чтобы мигрировать постепенно.

**Как устроено.** В `pocketmine.yml` секция `transport:`. При наличии `ext-webrtc` поднимается NetherNet (signaling TCP + ICE UDP). Без расширения сервер логирует пропуск и остаётся на RakNet.

**Как пользоваться.**

```yaml
transport:
  name: nethernet,raknet   # dual на время миграции
```

- Нужен PHP с `ext-webrtc` (сборки axolotl-pm/PHP-Binaries).
- Ключ идентичности: `nethernet.key` (создаётся сам). **Бэкапить** — смена ключа заставляет игроков заново подтверждать trust (TOFU).
- Firewall: TCP signaling (`server-port` / builtin-signaling.port) + UDP ICE range; LAN discovery UDP 7551.
- STUN в шаблоне есть; для жёсткого NAT нужен TURN.
- Подробно: [/docs/rubyx/nethernet](/docs/rubyx/nethernet).

Capability: `nethernet`.

---

### Transfer API

**Зачем.** Перекинуть игрока на другой сервер (прокси / другой инстанс арены) с нормальным Bedrock `TransferPacket`, плюс хуки для плагинов.

**Как пользоваться.**

```php
// базовый transfer
$player->transfer("play.example.com", 19132);

// событие можно отменить / подправить
// PlayerTransferEvent — reloadWorld, GatheringJoinInfo и т.д.
```

Для NetherNet-назначения `host:port` должны указывать на **signaling** endpoint цели. Полный seamless WebRTC handoff между серверами пока не поддерживается полностью.

---

### Folder resource packs

**Зачем.** Разработчикам удобнее править пак как папку с `manifest.json`, а не только как `.zip`/`.mcpack`.

**Как устроено.** `ResourcePackManager` при загрузке зипует folder-pack в compression cache (оригиналы в `resource_packs/` не трогает). Можно крутить размер/параллельность чанков скачивания:

```yaml
# resource_packs.yml
pack_chunk_size_kb: 128
pack_chunk_concurrency: 2
```

Capability: `folder-packs` (см. раздел resource packs).

---

## Adaptive QoS и session recording

### Adaptive QoS

**Зачем.** На высоком ping клиент «не успевает» за чанками/сущностями → резинка, таймауты. Временно **урезать view distance** слабым каналам дешевле, чем кикать.

**Как устроено.** `AdaptiveQosManager` смотрит EWMA ping игрока, держит soft/hard пороги и hysteresis (чтобы дистанция не дёргалась каждый тик). Эффективный радиус никогда не поднимается выше того, что запросил клиент/плагин и что позволяют memory limits.

**Как пользоваться.**

```yaml
network:
  adaptive-qos:
    enabled: true
    ping-soft-ms: 150
    ping-hard-ms: 300
    recover-ms: 100
    soft-view-distance: 6
    hard-view-distance: 4
    min-view-distance: 3
    check-interval-ticks: 40
```

По умолчанию **выключено** — включайте после теста на своей базе. Capability: `adaptive-qos`. Docs: [/docs/rubyx/adaptive-qos](/docs/rubyx/adaptive-qos).

---

### Session recording

**Зачем.** Forensics / разбор жалоб / лёгкий anticheat-aid: что делал игрок (движение, чат, урон, инвентарь), без полного packet-demo.

**Как устроено.** Append-only **JSONL** в каталоге `session_recordings/` (настраивается). Сэмплы движения раз в N тиков, опционально имена входящих пакетов (без payload). Лимит размера файла.

**Как пользоваться.**

```yaml
session-recording:
  enabled: true
  auto-record-all: false
  directory: session_recordings
  move-sample-ticks: 5
  record-packet-ids: false
  max-file-mb: 64
```

```text
/sessionrecord start <player>
/sessionrecord stop <player>
/sessionrecord status
```

Permission: `pocketmine.command.sessionrecord`. Capability: `session-record`.  
Это **не** полноценный replay клиента. Docs: [/docs/rubyx/session-recording](/docs/rubyx/session-recording).

---

## Resource packs

Конфиг: `resource_packs.yml`. Docs: [/docs/rubyx/resource-packs](/docs/rubyx/resource-packs).

### World / named stacks

**Зачем.** У лобби один набор паков, у арены — другой. Глобальный `resource_stack` недостаточен.

**Как устроено.**

- `world_stacks.<имя_папки_мира>` — стек для мира.
- `named_stacks.<имя>` — именованные стеки для плагинов.
- На логине клиенту предлагается стек **дефолтного** мира (если задан), иначе глобальный.

```php
$rpm = $server->getResourcePackManager();
$stack = $rpm->getResourceStackForWorld("arena");
$named = $rpm->getNamedStack("pvp_ui");
```

**Важно.** Bedrock **не умеет** горячо менять resource packs mid-session. После смены стека / `/resourcepacks reload` игрокам нужен **reconnect**.

---

### CDN (#10)

**Зачем.** Тяжёлые паки выгоднее качать с CDN, а не чанками с игрового сервера.

```yaml
cdn_urls:
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx": "https://cdn.example.com/pack.zip"
  "lobby_textures.zip": "https://cdn.example.com/lobby_textures.zip"
```

URL уходят в `ResourcePacksInfoPacket`. Локальные паки лучше оставлять как fallback. Плагины могут переопределить через `PlayerResourcePackOfferEvent::setCdnUrls()`.

---

### Unchanged packs / client cache (#11)

**Зачем.** Не гонять повторную закачку, если контент не менялся.

**Как устроено.** Клиент кэширует по **UUID + version**. Ядро считает fingerprint `uuid|version|sha256` и при reload пишет в лог, если fingerprint изменился. Кастомный binary-diff протокол **не** внедрялся.

Практика: мелкий правка текстур → bump `version` в `manifest.json`, UUID оставить.

```php
$fp = $rpm->getPackContentFingerprint($pack); // uuid|version|sha256hex
```

---

### Encryption UX (#13)

**Зачем.** Защищённые паки (ключ 32 байта) без боли в конфиге.

- Файл `<pack>.key` рядом с паком, **или**
```yaml
resource_stack:
  - pack: secret.zip
    key_file: secret.zip.key
```

Успех логируется (`Encrypted resource pack "..."`). Битый/неподходящий ключ — warning.

---

### Hot-reload (#14)

```text
/resourcepacks reload
```

Permission: `pocketmine.command.resourcepacks`.  
Перечитывает манифесты/стеки с диска. Уже залогиненные игроки **не** получают новый стек, пока не перезайдут.

---

## Миры и чанки

Docs: [/docs/rubyx/multiworld](/docs/rubyx/multiworld). Capabilities: `world-clone`, `multiworld-commands`.

### Команды `/world` (alias `/mw`, `/multiworld`) — MultiWorld-модуль в ядре

Permission: `pocketmine.command.world` (обычно ops).  
Плагин `plugins/MultiWorld` перенесён в `plugins_backup/MultiWorld`. Capability: `multiworld-module`.

| Команда | Назначение |
|---------|------------|
| `/world list` | вертикальный список миров (Loaded/Unloaded + игроки + размер на диске) |
| `/world create <name> [seed] [gen]` | создать мир (`normal`/`flat`/`nether`/`void`) |
| `/world delete <name>` | удалить папку (не default) |
| `/world rename <from> <to>` | переименовать папку + LevelName |
| `/world load <name>` | загрузить папку мира |
| `/world unload <name>` | выгрузить (не default; игроков по возможности на spawn default) |
| `/world tp <world> [player]` | ТП на safe spawn (подгрузит мир) |
| `/world clone\|duplicate <src> [dest]` | безопасная копия LevelDB + load |
| `/world info [name]` | generator, seed, игроки, spawn |
| `/world update spawn\|lobby\|default` | spawn / хаб / default world |
| `/world manage` | FormAPI UI |
| `/gamerule …` | per-world gamerules (`pocketmine.command.gamerule`) |

### WorldEdit (core module)

Бывший плагин EasyEdit (`plugins/WorldEdit`) встроен в ядро:

- код: `src/world/worldedit/` (`pocketmine\world\worldedit`)
- ресурсы: `resources/worldedit/`
- данные: `plugin_data/WorldEdit/` (миграция с `plugin_data/EasyEdit` при старте)
- permissions: `worldedit.*`
- команды игрока без изменений: `//wand`, `//set`, `//copy`, `//paste`, …
- бэкап плагина: `plugins_backup/WorldEdit`
- capability: `worldedit`

### Команда `/spawn`

ТП на **safe spawn default world** (не bed / `spawnpoint`, не spawn текущего мира).

| Команда | Permission | Кто |
|---------|------------|-----|
| `/spawn` | `pocketmine.command.spawn.self` | все игроки |
| `/spawn <player>` | `pocketmine.command.spawn.other` | ops |

Console без ника — syntax error. Ошибки `getSafeSpawn` логируются игроку, без краша.

### API WorldManager

```php
$wm = $server->getWorldManager();

$wm->isWorldLoaded("arena");
$wm->isWorldGenerated("arena"); // похоже на мир на диске
$wm->getWorldFolderNames();
$wm->getWorldPath("arena");
$wm->loadWorld("arena");
$wm->unloadWorld($world);

// Клон арены из шаблона. Источник должен быть БЕЗ игроков.
// Если источник загружен — save → unload → copy → reload.
$clone = $wm->cloneWorld("template", "match_1"); // World|null, иначе WorldException
```

Типичный сценарий мини-игры: держать чистый template (разгруженный или пустой) и клонировать на каждый матч.

### Smart chunk unload

**Зачем.** Экономия RAM на больших картах / многих мирах: неиспользуемые чанки уходят в unload с политикой idle.

```yaml
chunk-ticking:
  unload:
    enabled: true
    max-chunks-per-tick: 16
    idle-ticks: 200   # ~10 с при 20 TPS
```

Spawn-чанки и чанки с viewers/loaders не выгружаются. Грязные чанки сохраняются при autosave. Более агрессивный unload = меньше RAM, но возможна задержка при возврате игрока.

### VoidGenerator

Встроенный пустой генератор для арен (`GeneratorManager`). Создаёте мир с generator `void` — без террейна ваниллы.

---

## Плагины: загрузка и lifecycle

Docs: [/docs/rubyx/plugin-api](/docs/rubyx/plugin-api).

### Folder plugins (#28)

**Зачем.** DevTools больше не обязателен, чтобы просто **запустить** плагин из папки.

Структура:

```text
plugins/MyPlugin/
  plugin.yml
  src/...
```

DevTools оставляйте для `makeplugin` / упаковки `.phar`. Capability: `folder-plugins`.

---

### Soft reload (#29 lite)

```text
/plugin reload <name>
```

Alias `/plm`, permission `pocketmine.command.plugin`.

**Что делает:** `disable` → `enable` **того же объекта** плагина (сброс конфига/состояния, если плагин это поддерживает в onDisable/onEnable).

**Чего не делает:** не перечитывает PHP-классы с диска. Смена кода = restart (или новый `.phar`). Dependents должны быть выключены, иначе reload упадёт с понятной ошибкой.

---

### Install from URL (#27 lite)

```text
/plugin install https://example.com/MyPlugin.phar
```

Также поддерживается zip с `plugin.yml` + `src/` в корне. Только HTTPS. Лимит размера:

```yaml
plugins:
  install:
    enabled: true
    max-mb: 32
```

Файл кладётся в `plugins/`, но **не включается**, пока не сделаете restart. Нет marketplace / подписей / auto-update.

---

## Ops и безопасность

Docs: [/docs/rubyx/ops](/docs/rubyx/ops).

### Abuse limits (#39)

**Зачем.** Спам чата/команд без мгновенного kick (kick часто обходят / вредят UX). Soft token-bucket: дроп действия + предупреждение.

```yaml
abuse-limits:
  chat:
    enabled: true
    max-per-second: 2
    burst: 4
  commands:
    enabled: true
    max-per-second: 4
    burst: 8
```

Консоль не лимитируется. Warn throttling ~2 с (чтобы не заспамить лог). Отдельные лимиты batch пакетов по-прежнему свои.

---

### Crash dump scrubbing (#42)

**Зачем.** В crash report легко утекает `rcon.password`, токены БД, argv.

**Как устроено.** Перед включением настроек/phpinfo/argv в дамп строки с password/secret/token/… заменяются на `******` (`CrashDumpScrubber`).

Рекомендация: в проде держать `auto-report.send-phpinfo: false`.

---

### Healthcheck (#51)

**Зачем.** Docker/K8s должны понимать, жив ли процесс и не в drain ли он.

Пока сервер работает, каждую секунду пишется `health.status` в data-dir:

```text
ok <tick> <unix_ts>
```

При shutdown/drain:

```text
stopping <unix_ts>
```

`Dockerfile` / `docker-compose` используют `/usr/local/bin/docker-healthcheck.sh`.  
K8s exec: тот же скрипт + путь к файлу + freshness (по умолчанию 15 с, строка должна начинаться с `ok `).

---

### Soft shutdown / drain (#54)

**Зачем.** Жёсткий kill рвёт сохранения и матчи. Drain даёт игрокам время выйти / доиграть до дедлайна.

```yaml
shutdown:
  drain-seconds: 10   # 0 ≈ сразу как раньше
```

На SIGTERM / `/stop`:

1. Режим drain, health → `stopping`, короткое сообщение игрокам  
2. Новые логины отклоняются («Server is shutting down»)  
3. Тики продолжаются, пока нет игроков **или** вышло время  
4. Затем обычный `forceShutdown()` (kick остатка, save, unload)

В логе — старт/конец drain с числом игроков.

---

### Clearer logs (#53)

Меньше шума: rate-limit warn один раз в окне; drain с явными строками; пер-сессионный PrefixedLogger для disconnect-шума.

---

## UI и данные игрока

### FormAPI (#45)

**Зачем.** Единые формы в ядре (`pocketmine\form\*`), без обязательной зависимости от сторонних FormAPI. MiniGameBase-формы остаются для старых плагинов.

```php
use pocketmine\form\SimpleForm;
use pocketmine\form\ModalForm;
use pocketmine\form\CustomForm;

$form = new SimpleForm(function(Player $player, mixed $data) : void{
	// $data: int (индекс кнопки) или null (закрыл крестиком)
});
$form->setTitle("Магазин")
	->setContent("Выбери")
	->addButton("Купить")
	->addButton("Отмена");
$form->send($player);
```

- `ModalForm` — две кнопки + текст  
- `CustomForm` — `addInput` / `addToggle` / `addSlider` / `addDropdown` / `addLabel` / `addStepSlider`  
- Невалидный ответ → `FormValidationException` в лог, без краша  

Capability: `form-api`.

JSON-формы (`ModalForm` / `CustomForm` через `sendForm`) **закрываются** на каждое действие клиента. Для **реактивного UI** без пересборки см. раздел **DDUI** ниже.

---

### Plugin data-version (#50)

**Зачем.** При обновлении плагина нужно один раз смигрировать `plugin_data/`.

```yaml
# plugin.yml
data-version: 2
```

Или override `PluginBase::getPreferredDataVersion()` / `migrateData(int $from, int $to)`.  
Версия хранится в `plugin_data/<Plugin>/data-version`. `0` = проверка выключена.

Capability: `plugin-data-version`.

---

### XUID player files (#47 lite)

**Зачем.** Ник можно сменить; XUID (Xbox) стабильнее. Без dual-write смена ника = «новый» инвентарь / потеря прогресса.

**Как устроено.** При authenticated save пишутся оба файла:

- `players/<name>.dat`  
- `players/xuid/<xuid>.dat`  

Load сначала ищет XUID-файл, потом name. Offline / без XUID — как раньше по имени.

Capability: `xuid-playerdata`. Полный SQL/Redis store — не в этой волне.

---

### UnknownItem (#49 lite)

**Зачем.** Кастомный/будущий предмет из мира или инвентаря не должен превращаться в воздух при save.

Неизвестный тип → `UnknownItem` с сохранённым `SavedItemData`; при записи тип восстанавливается. На клиенте может отображаться как info_update. Стак = 1 (чтобы не склеивать разные unknown).

Capability: `unknown-item`. Unknown **block** palette — .

---

## Сохранения, tick freeze и метрики

### Durable small-file save (#48 lite)

**Зачем.** `file_put_contents` при полном диске может обрезать файл. Temp + rename безопаснее; fsync уменьшает окно «данные ещё в page cache».

```yaml
world:
  save:
    fsync: true           # safeFilePutContents: fflush + fsync temp перед rename
    region-fsync: false   # fsync region-файлов только на close (дороже)
```

Используется для мелких файлов (конфиги, player.dat path, banlist, install `.phar` и т.п.). LevelDB chunk batches — отдельная история .

---

### Tick freeze (#59)

**Зачем.** Отладка матчей / воспроизведение бага: остановить игровой тик, но оставить сеть и консоль.

```text
/tick freeze
/tick step 5
/tick query
/tick unfreeze
```

Permission: `pocketmine.command.tick`.  
Пока freeze: **не** тикают миры и plugin schedulers. Сеть, консоль, health, drain, metrics — работают. `step N` прогоняет N тиков и снова freeze.

Capability: `tick-freeze`.

---

### Prometheus metrics (#52 lite →  histograms)

**Зачем.** Наблюдаемость TPS/игроков/памяти/миров без сторонних плагинов.

```yaml
metrics:
  enabled: true
  file: true              # пишет metrics.prom раз в секунду
  bind: "127.0.0.1:9090"  # опционально GET /metrics
```

Gauges: TPS, tick usage, players, memory, tick counter, freeze, per-world chunks/entities/tick-ms.  
Histograms : `pmmp_tick_duration_seconds`, `pmmp_world_tick_duration_seconds` (фиксированные бакеты).

Capability: `prometheus-metrics`. Docs: [/docs/rubyx/ops](/docs/rubyx/ops).

---

## Камера и unit-тесты

### Camera shake / fade / clear

**Зачем.** Плагинам нужны cutscene / hit feedback / затемнение без ручной сборки пакетов.

```php
use pocketmine\color\Color;
use pocketmine\network\mcpe\protocol\CameraShakePacket;

$player->shakeCamera(0.5, 2.0); // intensity, duration sec; TYPE_ROTATIONAL по умолчанию
$player->shakeCamera(1.0, 1.0, CameraShakePacket::TYPE_POSITIONAL);
$player->stopCameraShake();

$player->fadeCamera(0.5, 1.0, 0.5);                    // чёрный
$player->fadeCamera(0.3, 0.5, 0.3, new Color(255, 0, 0));
$player->clearCamera();
```

Внутри: `CameraShakePacket` / `CameraInstructionPacket` через `NetworkSession`.  
Capability: `camera-instruction`. Ручной smoke на Bedrock: shake → fade → clear.

### PHPUnit helpers (#60 lite)

Unit-тесты без живого Server: `AbuseRateLimiter`, `CrashDumpScrubber`, `SimpleForm`, `Filesystem::safeFilePutContents`, `UnknownItem` под `tests/phpunit/`.

---

## Расширенные возможности ядра

### Camera full (presets / set / FOV / target)

Расширение  до управленя камерой через instruction/presets:

```php
use pocketmine\network\mcpe\protocol\types\camera\CameraPreset;
use pocketmine\network\mcpe\protocol\types\camera\CameraSetInstruction;
use pocketmine\network\mcpe\protocol\types\camera\CameraFovInstruction;
use pocketmine\network\mcpe\protocol\types\camera\CameraTargetInstruction;

$player->sendCameraPresets(/* CameraPreset ...$presets */);
$player->setCamera($setInstruction);
$player->setCameraFov($fovInstruction);
$player->setCameraTarget($targetInstruction);
$player->setCameraTarget(null, true); // removeTarget
```

Типы инструкций — из BedrockProtocol (`vendor/.../types/camera/`).  
**Ещё нет:** aim-assist пакеты, spline keyframe DSL — их можно слать вручную через `NetworkSession::sendDataPacket`, но first-class API нет.

---

### Movement guard (#44 lite)

**Зачем.** Жёсткий лимит «15 блоков за один movement» был захардкожен. Нужны конфиг и доп. лимит горизонтали за тик, чтобы резать явный телепорт-чит без полного prediction-AC.

```yaml
player:
  movement:
    enabled: true
    max-blocks-per-move: 15    # один PlayerAuthInput
    max-blocks-per-tick: 10.0  # горизонталь за processMostRecentMovements
```

При нарушении — `revertMovement` / `MovePlayerPacket::MODE_RESET` (резинка) + debug в лог сессии. Creative/spectator для per-tick check пропускаются.

Capability: `movement-guard`.  
**Это не** server-authoritative physics и не `CorrectPlayerMovePrediction` loop.

---

### Unknown block palette (#49)

**Зачем.** Как UnknownItem, но для блоков в чанках: неизвестный state не должен навсегда стать `info_update` при save.

**Как устроено.** `UnknownBlockStateStore` выделяет runtime state id и держит исходный `BlockStateData`. LevelDB deserialize при `UnsupportedBlockStateException` (и по возможности при upgrade failure) регистрирует state; serialize пишет оригинальный NBT.

Capability: `unknown-block`. Визуально на клиенте блок всё ещё может выглядеть unknown — цель именно **не потерять данные мира**.

---

### LevelDB durability sidecar (#48 lite+)

**Зачем.** В PHP-расширении LevelDB нет надёжного fsync API → полноценный WAL в ядре не сделать честно. Sidecar даёт ops-маркер «последняя успешная batch-запись».

```yaml
world:
  save:
    leveldb-sidecar: true
```

После `$db->write($batch)` обновляется `worlds/<name>/db/LAST_FLUSH` через `safeFilePutContents`. Это **не** восстанавливает чанки после краша само по себе — только след для forensics / мониторинга.

---

### Datapacks recipes (#57 lite)

**Зачем.** Добавлять рецепты без пересборки phar bedrock-data, папками на диске.

```text
datapacks/
  my_pack/
    recipes/
      shapeless_crafting.json
      shaped_crafting.json
      potion_type.json
      ...
```

Формат JSON — **тот же PM/bedrock-data**, что грузит `CraftingManagerFromDataHelper` (не vanilla Java datapack). При старте сервер мержит паки в crafting manager; ошибки пака логируются, boot не валится.

Capability: `datapacks`. Loot tables / tags / advancements — нет.

---

### Plugin security scan (#40 lite)

**Зачем.** Настоящий process-sandbox — отдельный мегапроект. Lite: перед load просканировать исходники плагина на опасные вызовы.

```yaml
plugins:
  security-scan: true
  security-scan-mode: warn   # warn | fail
```

Ищет в `.php`: `eval`, `assert`, `shell_exec`, `passthru`, `proc_open`, `pcntl_exec`, `system`, `exec`, `popen`.  
`warn` — warning в лог и загрузка продолжается; `fail` — плагин не грузится.

Capability: `plugin-security-scan`.  
Для реальной защиты: `disable_functions` / `open_basedir` в `php.ini`.

---

### TesterPlugin / phpunit (#60)

TesterPlugin на старте прогоняет ClosureTests: script plugin load, capabilities , наличие camera-методов на `Player`, SimpleForm serialize.  
PHPUnit: store / MovementGuard / histogram / security scanner (+  helpers).  
Полноценный deterministic gameplay harness (физика матча) — не делался.

---

## Дополнительные возможности

### #40 Sandbox hardening lite+
- `resources/php.ini.recommended` + boot NOTICE если опасные функции ещё доступны
- Scanner: backticks / `create_function` / `preg_replace /e`; `assert` только в `fail` mode

### #44 Prediction correction lite+
- `player.movement.send-prediction-correction` → `CorrectPlayerMovePredictionPacket` на rubberband

### #57 Datapack item tags lite+
- `datapacks/<pack>/tags/items/*.json` → `ItemTagToIdMap` (не Java datapacks)

### #16 Legacy Anvil write + export
- `WritableAnvil` + `/world export-anvil <src> <dest>` (lossy; не Java 1.13+ palette)

### #17 Light defer lite+
- `world.light.defer-updates` (default true = coalesce до конца тика)

### #43 Camera aim-assist / spline / attach
- `sendCameraAimAssistPresets` / `sendCameraAimAssist` / `setCameraSpline` / `attachCameraToEntity` / `detachCameraFromEntity`

### #48 LAST_FLUSH observability
- `pmmp_world_leveldb_flush_age_seconds` + `health.status` `flush_age_s:…` (не WAL)

---

## Доработки эксплуатации

### NetherNet signaling TLS noise
- Plain-HTTP NOTICE убран: без cert/key — только `debug` (и тишина при `reverse-proxy.enabled`).
- Certs: `transport.nethernet.builtin-signaling.tls.{certificate,key,passphrase}`.

### `/plugin install` load+enable
- После download — `loadPlugins($path)` + `enablePlugin` без полного restart.

### MultiWorld generators
- Core `ender` / aliases `ender_mw`, `end` (`EnderGenerator` lite).
- `normal_mw` — alias на core `normal` (кастомный MW NormalGenerator не портирован).

### Phar/zip interior security-scan
- Scanner читает `.php` внутри `.phar` / `.zip`.

### World-folder datapacks
- Плюс к `datapacks/`: `worlds/<world>/datapacks/<pack>/` (recipes + item tags).

### Light population 3×3 neighbors
- `LightPopulationTask` передаёт соседний terrain (если загружен) для border light.

### Richer LAST_FLUSH
- Sidecar JSON `{unix,tick,chunk_x,chunk_z}`; legacy plain unix читается. Age metrics без изменений.

---

## Камера (DSL) и доработки

### WorldEdit schematic tiles
- McEdit `.schematic`: load `TileEntities` via `TileConvertor`.
- Sponge: fallback root `Offset` int[3] when Metadata WEOffset* absent.
- Convertors: Lectern, Beacon, MobSpawner, BrewingStand, Campfire, Cauldron.

### WorldEdit schematic entities (lite)
- `//schematic load` parses entities into clipboard (`BlockListSelection` list, not chunk-keyed).
- Formats: `.mcstructure` (`structure.entities`), `.schem` Sponge v2/v3 `Entities`, `.schematic` McEdit `Entities`.
- `//paste` spawns via main-thread `EntityFactory::createFromData` after chunks/tiles (`ResultingEntityData`).
- Unknown ids skipped; UUID/UniqueID stripped. **Still deferred:** schematic save, `//copy`/`//cut` world entities, rotate/flip, LoaderManager preserve-on-overwrite.

### RakNet opt-in
- Default `transport.name: nethernet` (was dual). Dual = explicit `nethernet,raknet`.

### phpstan plugin ban-list
- [`phpstan-plugin-baseline.neon`](https://github.com/RubyxGames/PocketMine-MP/blob/stable/phpstan-plugin-baseline.neon) + docs; package split wontfix.

### Camera spline DSL
- `pocketmine\player\camera\CameraSplineBuilder` + `Player::sendNamedCameraSplines()`.

---

## Платформенные ограничения

- PM loot tables: `datapacks/<pack>/loot_tables/*.json` → `DatapackLootRegistry::roll()` (+ pack.mcmeta notice).
- Movement correction sends **real motion** (+ flying as onGround hint); not a physics loop.

- Light execute counters in Prometheus (`pmmp_light_*_execute_total`).
- Anvil **1.13+ paletted section read** (lossy via WE Java→Bedrock); write remains legacy.

###  / platform walls (closed)
| Тема | Статус |
|------|--------|
| OS process sandbox | **wontfix** (PHP) — token scan + open_basedir NOTICE + php.ini.recommended |
| LevelDB WAL/fsync | **wontfix** (no ext API) — LAST_FLUSH JSON + age metrics |
| Vanilla Java datapacks | **wontfix** — PM recipes/tags/loot |
| Anvil 1.13+ paletted **write** | **deferred/wontfix** — legacy write + lossy palette **read** |
| Full off-thread incremental light | **wontfix** — async populate + defer + metrics |
| Full server-auth prediction | **wontfix** — movement-guard + velocity correction |
| Camera spline DSL | **shipped** (builder + named splines) |

Schematic entity **save / world copy / rotate** still deferred (lite load+paste shipped above).

---

## Data-Driven UI (DDUI, Bedrock 1.26+)

**Зачем.** Bedrock 1.26+ умеет экраны с **общим data store**: сервер шлёт `ClientboundDataStoreUpdate`, клиент не закрывает форму. Это замена «открыть JSON CustomForm заново» для чатов, магазинов, опросов с live-полями.

**Связь с FormAPI.** Классический `ModalForm` / `CustomForm` через `sendForm()` по-прежнему основной путь для простых форм. DDUI — для реактивных экранов с data store.

### Включение

```yaml
# pocketmine.yml
ddui:
  enabled: true
  replace-delay-ticks: 20
  session-timeout-ticks: 6000
  max-inbound-updates-per-tick: 32
  max-outbound-updates-per-tick: 64
  default-theme: rubyx:classic
  themes:
    rubyx:postsystem:
      style-id: rubyx:classic
```

Клиент: **протокол ≥ 1.26.0** (целевой smoke — **1.26.60**). Отключить: `ddui.enabled: false`.

### Детект и API игрока

```php
if($player->supportsDdui()){
    $player->sendDduiForm($form);
    $player->pushDduiClientUpdates($updates); // список DataStoreUpdate
}
$player->getDduiProtocolTier(); // full | with_screen_close | base | unsupported
```

Подробно: [/docs/rubyx/plugin-api-ddui](/docs/rubyx/plugin-api-ddui), контракт пакетов: [/docs/rubyx/DDUI_WIRE_CONTRACT](/docs/rubyx/DDUI_WIRE_CONTRACT).

### Встроенные экраны (vanilla `screenId`)

| screenId | Назначение |
|----------|------------|
| `minecraft:message_box` | Два действия; fallback на `ModalForm`, если DDUI нет |
| `minecraft:custom_form` | Колонка контролов (label, toggle, textfield, button, …) |

Реализация: `src/form/ddui/` — `DduiSessionManager`, `DduiNetworkAdapter`, `DduiLayoutBuilder`, `DduiClientUpdates`.

### Reactive push

Порядок открытия: **DataStoreChange** (полное дерево) → **ShowScreen** (`screenId`, `formId`, опционально `dataInstanceId` на ≥ 1.26.20).

Дальше сервер пушит пути вроде `layout.2.text`, `title`, `button1.onClick` без `sendForm()`.

Опциональный hook: `DduiFormOnOpen::onDduiOpen()`.

События: `DduiFormCloseEvent`, `DduiFormClientUpdateEvent`, `DduiFormResponseEvent`.

### Theme API (RP styling)

Скан **resource stack** на `ddui/styling/*.json` (`minecraft:ui-style`, format `beta`).

- Реестр: `DduiThemeRegistry` (boot + `/resourcepacks reload`).
- В форме: `DduiLayoutBuilder::applyThemePreset('rubyx:postsystem')` или root `styleId`.
- Ограничение клиента: стиль в основном **панель / label / textfield**; не дублирует JSON UI PostSystem layout.

Док: [/docs/rubyx/DDUI_THEMING](/docs/rubyx/DDUI_THEMING).

### Команда и smoke

- **`/ddui`** (`pocketmine.command.ddui`) — тестовые DDUI-экраны (MessageBox, CustomForm, reactive demo).
- Чеклист: [/docs/rubyx/DDUI_MANUAL_SMOKE](/docs/rubyx/DDUI_MANUAL_SMOKE).
- PHPUnit: `tests/phpunit/form/ddui/*`.

### MiniGameBase

`FormManager::sendDduiForm($player, $form, $forceOpen)` — те же правила single-open/cooldown, что у `sendForm()`.

### Смешивание с JSON-формами

`Player::sendForm()` закрывает активные DDUI-сессии. `sendDduiForm()` закрывает legacy ModalForm. Одновременно держать JSON PostSystem и DDUI push **нельзя** без отдельного кастомного экрана.

### Карта кода

| Область | Путь |
|---------|------|
| Сессии / пакеты | `src/form/ddui/DduiSessionManager.php`, `DduiNetworkAdapter.php` |
| Handlers | `src/network/mcpe/handler/*Ddui*` (serverbound DataStore / screen closed) |
| NetworkSession | `getDduiSessionManager()`, send path |
| Builder / темы | `DduiLayoutBuilder.php`, `DduiThemeScanner.php`, `DduiThemeRegistry.php` |
| Команда | `src/command/defaults/DduiCommand.php` |

Статус внедрения по фазам: [/docs/rubyx/DDUI_IMPLEMENTATION_STATUS](/docs/rubyx/DDUI_IMPLEMENTATION_STATUS).

---

## `/status` — понятный статус сервера

**Зачем.** Старый `/status` был техническим (TPS, кБ/с, «чанки»). Для операторов в консоли удобнее читать простыми словами: плавность игры, кто онлайн, чем подключаются, сколько плагинов живы.

**Что показывает** (rus; eng зеркалит те же ключи):

| Строка | Смысл |
|--------|--------|
| Ядро | Имя + версия ядра (`RubyxGames`) |
| Игроков онлайн | `сейчас / лимит` |
| Работает уже | Аптайм |
| Плавность сейчас / за время (TPS) | Тики в секунду и нагрузка тика |
| CPU | Загрузка хоста 0–100% (`/proc/stat`) |
| RAM | занято / всего (MB или GB) и % |
| Диск | занято / всего на ФС data-dir (MB или GB) и % |
| Трафик к / от игроков | Исходящий / входящий кБ/с |
| Тип подключения | Активные транспорты (`nethernet`, `raknet`, …) |
| Плагинов включено | `enabled / всего` |
| Фоновых потоков | Число потоков процесса |
| Мир … | Куски карты в памяти, обновляемые, объекты, мс на тик |

Если тик заморожен (`/tick freeze`) — отдельная красная строка: игровое время и мобы на паузе.

**Как пользоваться.** Консоль или игрок с `pocketmine.command.status`: `/status`. Строки из `resources/translations/{rus,eng}.ini` (`pocketmine.command.status.*`); после правок ini — codegen `build/codegen/known-translation-apis.php`.

**Код.** `src/command/defaults/StatusCommand.php`.

---

## Быстрый чеклист оператора

1. **`pocketmine.yml`** — `transport`, `abuse-limits`, `shutdown.drain-seconds`, `world.save.*`, `player.movement`, `metrics`, `plugins.security-scan`, `network.adaptive-qos`, `session-recording`  
2. **`resource_packs.yml`** — стеки, CDN, ключи шифрования  
3. **`datapacks/`** (+ опционально `worlds/<name>/datapacks/`) — рецепты / item tags  
4. **Команды** — `/spawn`, `/world`, `/sessionrecord`, `/resourcepacks reload`, `/tick`, `/plugin reload|install` (install enable без restart), `/status` (понятный вывод)  
5. **Плагины** — `requires-capabilities`; FormAPI + **`Player::supportsDdui()`** / `sendDduiForm`; Camera API; `WorldManager::cloneWorld`  
6. **Наблюдаемость** — `health.status`, `metrics.prom` / `/metrics`, session recordings, `/status`  

---

## Карта «идея → где читать код»

| Идея | Ключевые точки в `src/` |
|------|-------------------------|
| Capabilities | `plugin/ServerCapabilities.php`, register в `Server.php` |
| NetherNet | `network/mcpe/nethernet/` |
| Adaptive QoS | `network/qos/AdaptiveQosManager.php` |
| Session record | `sessionrecord/` |
| Resource packs | `resourcepacks/ResourcePackManager.php` |
| Multiworld / clone | `world/WorldManager.php`, `world/WorldCloner.php` |
| Folder plugins | `plugin/FolderPluginLoader.php` |
| Abuse limits | `network/AbuseRateLimiter.php`, `AbuseLimitsManager` |
| Crash scrub | `crash/CrashDumpScrubber.php` |
| Forms (JSON) | `form/*` |
| DDUI | `form/ddui/*`, `NetworkSession::getDduiSessionManager()` |
| Unknown item/block | `item/UnknownItem.php`, `data/bedrock/block/UnknownBlockStateStore.php` |
| Camera | `player/Player.php`, `network/mcpe/NetworkSession.php` |
| Movement guard | `player/MovementGuard.php` |
| Metrics | `metrics/PrometheusTextRenderer.php`, `MetricsHistogram.php` |
| Datapacks | `crafting/DatapackRecipeLoader.php`, `DatapackTagLoader.php` |
| Security scan | `plugin/PluginSecurityScanner.php`, `resources/php.ini.recommended` |
| Anvil export | `world/format/io/region/WritableAnvil.php`, `AnvilWorldExporter.php` |
| Light policy | `world/light/LightUpdatePolicy.php` |
| Status UX | `command/defaults/StatusCommand.php`, `resources/translations/{rus,eng}.ini` |
| WE schematic entities | `world/worldedit/utils/EntityUtils.php`, `thread/output/ResultingEntityData.php`, schematic `type/*` |

---

*Справочник соответствует ядру RubyxGames 1.0.0+ (DDUI — экспериментальная область).*
