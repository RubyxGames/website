# Session Recorder

Запись игровой сессии в append-only **JSONL** для разбора жалоб, forensics и лёгкого anticheat-aid.

Это **не** полноценный packet-demo / клиентский replay: сохраняются семплы событий (движение, чат, урон, инвентарь и т.д.), без сырых payload сетевых пакетов.

Код: `src/sessionrecord/`. Команда: `/sessionrecord`. Capability: `session-record`.

---

## Быстрый старт

1. В `pocketmine.yml` включить запись:

```yaml
session-recording:
  enabled: true
  auto-record-all: false
  directory: session_recordings
  move-sample-ticks: 5
  record-packet-ids: false
  max-file-mb: 64
```

2. Перезапустить сервер (менеджер читает конфиг при старте).

3. Записать конкретного игрока:

```text
/sessionrecord start CandyDev
/sessionrecord status
/sessionrecord stop CandyDev
```

Право: `pocketmine.command.sessionrecord` (по умолчанию у ops).

Если `enabled: false`, команда откажется стартовать запись.

---

## Где хранятся файлы

Корень — относительно **data path** сервера (в Docker обычно `/data` = корень проекта):

```text
<dataPath>/<directory>/<Ник>/
```

По умолчанию:

```text
session_recordings/
  CandyDev/
    2026-11-07_204300_2535421306486693.jsonl
    2026-11-07_211500_2535421306486693.jsonl
  OtherPlayer/
    2026-11-07_220000.jsonl
```

| Часть пути | Смысл |
|---|---|
| `session_recordings/` | Каталог из `session-recording.directory` |
| `<Ник>/` | Папка игрока (небезопасные символы ника заменены на `_`) |
| `YYYY-mm-dd_HHMMSS[_xuid].jsonl` | Одна сессия: дата/время старта; XUID добавляется, если есть |

Ник в имени файла **не** дублируется — он уже в названии папки. Внутри JSON (`session_start`) ник и путь к файлу всё равно пишутся.

Старые записи, лежавшие плоско в корне `session_recordings/*.jsonl`, автоматически не переносятся.

---

## Конфиг (`pocketmine.yml`)

| Ключ | По умолчанию | Назначение |
|---|---|---|
| `enabled` | `false` | Включить менеджер и слушатели; без этого `/sessionrecord` не стартует |
| `auto-record-all` | `false` | Автостарт записи на каждый `PlayerJoin` |
| `directory` | `session_recordings` | Относительный каталог под data path |
| `move-sample-ticks` | `5` | Как часто **проверять** позицию (в тиках сервера). `0` — не писать `move` |
| `record-packet-ids` | `false` | Писать `packet_in` (имя + pid входящего пакета, **без** тела). Может сильно раздувать файл |
| `max-file-mb` | `64` | Лимит размера файла; при достижении — `limit_reached` и запись останавливается |

### Движение без спама

Сэмпл `move` пишется **только если изменилась поза**: `x`, `y`, `z`, `yaw`, `pitch` или `world` (после округления).  
Стояние на месте не засоряет JSONL одинаковыми строками. Интервал `move-sample-ticks` лишь ограничивает частоту проверки.

---

## Команды

| Команда | Действие |
|---|---|
| `/sessionrecord start <игрок>` | Начать запись (reason: `command`) |
| `/sessionrecord stop <игрок>` | Остановить (reason: `command`) |
| `/sessionrecord status` | Список игроков, у которых запись активна сейчас |

Автоостановка:

- выход игрока → `session_end` с reason `quit`;
- выключение сервера → reason `shutdown`.

Одновременно у одного игрока может быть только одна активная запись.

---

## Формат JSONL

Каждая строка — один JSON-объект:

```json
{"ts": 1794073416.195433, "type": "move", "x": 261.367, "y": 70, "z": 259.79, "yaw": 181.9, "pitch": 3.63, "world": "lobby"}
```

- `ts` — Unix-время с дробной частью (`microtime(true)`);
- `type` — тип события;
- остальные поля — payload конкретного типа.

### Типы событий

#### `session_start`

Старт записи.

| Поле | Описание |
|---|---|
| `reason` | `command`, `auto`, `manual`, … |
| `player` | Ник |
| `xuid` | Xbox User ID (может быть пустым) |
| `uuid` | UUID игрока |
| `protocol` | Protocol id клиента |
| `ip_hash` | SHA-256 от `IP\|UUID` (**сырой IP не пишется**) |
| `file` | Абсолютный/полный путь к этому JSONL |

#### `session_end`

| Поле | Описание |
|---|---|
| `reason` | `quit`, `command`, `shutdown`, … |
| `ping_ms` | Последний ping или `null`, если уже отключён |

#### `move`

| Поле | Описание |
|---|---|
| `x`, `y`, `z` | Координаты (округление до 3 знаков) |
| `yaw`, `pitch` | Углы (до 2 знаков) |
| `world` | Имя папки мира |

Пишется только при изменении позы (см. выше).

#### `ping`

| Поле | Описание |
|---|---|
| `ms` | RTT в миллисекундах |

Не чаще одного раза в секунду на игрока (из `NetworkSession::updatePing`).

#### `chat`

| Поле | Описание |
|---|---|
| `message` | Текст сообщения |

#### `interact`

Клик / использование предмета по блоку.

| Поле | Описание |
|---|---|
| `action` | Код действия `PlayerInteractEvent` |
| `x`, `y`, `z` | Пол блока |
| `item` | Имя предмета в руке |

#### `drop`

| Поле | Описание |
|---|---|
| `item` | Имя предмета |
| `count` | Количество |

#### `inventory_open` / `inventory_close`

| Поле | Описание |
|---|---|
| `inventory` | FQCN класса инвентаря |

#### `damage`

Пишется для жертвы и/или атакующего, если это игроки с активной записью.

| Поле | Описание |
|---|---|
| `cause` | Причина урона |
| `damage` | Финальный урон |
| `role` | `victim` или `attacker` |
| `attacker` | (для victim) ник или класс сущности |
| `victim` | (для attacker) ник или класс сущности |

#### `packet_in` (опционально)

Только при `record-packet-ids: true`.

| Поле | Описание |
|---|---|
| `name` | Имя пакета |
| `pid` | Packet id |

Тело пакета **не** сохраняется.

#### `limit_reached`

Файл достиг `max-file-mb`. Дальнейшая запись в этот sink прекращается.

| Поле | Описание |
|---|---|
| `max_file_mb` | Лимит из конфига |

---

## Как это работает внутри

1. При `enabled: true` `SessionRecordingManager` регистрирует MONITOR-слушатели (чат, interact, drop, инвентарь, урон, join/quit; опционально входящие пакеты).
2. `start()` создаёт папку игрока, открывает `JsonlSessionSink` и кладёт сессию в активные.
3. События вызывают запись **только** если для этого игрока есть активная сессия (иначе no-op).
4. Каждый тик сервера менеджер семплит `move` у активных записей.
5. `stop` / quit / shutdown пишут `session_end` и закрывают файл.

Ключевые классы:

| Класс | Роль |
|---|---|
| `SessionRecordingManager` | Конфиг, start/stop, слушатели, тик |
| `ActiveSessionRecording` | Одна активная сессия + дедуп `move` |
| `JsonlSessionSink` | Append-only запись и лимит размера |
| `SessionRecordCommand` | `/sessionrecord` |

---

## Ограничения и практика

- Не заменяет anticheat и не восстанавливает картинку «как на клиенте».
- При `auto-record-all: true` диск и I/O растут быстро — держите разумный `max-file-mb` и ротацию/архивацию папок вручную.
- `record-packet-ids: true` ещё сильнее раздувает файлы; для обычного разбора жалоб обычно не нужен.
- IP в открытом виде нет; есть только `ip_hash`.
- Слушатели при `enabled: true` зарегистрированы всегда; без активной записи события игрока в файл не попадают.

---

