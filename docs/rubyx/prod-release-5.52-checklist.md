# Чеклист: выкладка RubyxGames 5.52 в прод

Краткий pre-flight перед рестартом/обновлением инстанса (Docker **19135**, NetherNet).  
Отмечайте `[x]` по факту. Критичные пункты помечены **(BLOCKER)**.

Ссылки: `changelogs/5.52.md`, `docs/ops.md`, `docs/nethernet.md`, `docs/DDUI_MANUAL_SMOKE.md`, `docs/session-recording.md`.

---

## 1. Версия и артефакты

| # | Проверка | Как | OK |
|---|----------|-----|-----|
| 1.1 | **(BLOCKER)** `VersionInfo::BASE_VERSION` = `5.52.0`, имя `RubyxGames` | `/status` или лог старта | [ ] |
| 1.2 | Git/commit зафиксирован (support при инциденте) | `git rev-parse HEAD` на деплое | [ ] |
| 1.3 | `vendor/` собран на **том же** коммите, что и `src/` | `composer install --no-dev` на хосте, том в Docker | [ ] |
| 1.4 | **(BLOCKER)** Зафиксировать SHA `nethergamesmc/bedrock-protocol` и `bedrock-data` (`dev-master` в lock) | `composer.lock` → `source.reference` | [ ] |
| 1.5 | Понимание: `IS_DEVELOPMENT_BUILD = true` в `VersionInfo.php` — в логах/отчётах «dev» | Осознанно для прода или сменить перед релизом | [ ] |

---

## 2. PHP runtime (BLOCKER для NetherNet)

| # | Проверка | Как | OK |
|---|----------|-----|-----|
| 2.1 | **(BLOCKER)** PHP из `./runtime/bin/php7/bin/php` (как в `docker-entrypoint.sh`) | `docker exec rubyx-server /data/runtime/bin/php7/bin/php -v` | [ ] |
| 2.2 | **(BLOCKER)** `ext-webrtc` загружен (совместим с `NetherNetTransport::MIN_WEBRTC_VERSION`) | `php -m \| grep webrtc` **внутри контейнера** | [ ] |
| 2.3 | Обязательные ext: `pmmpthread`, `leveldb`, `encoding`, `chunkutils2`, `crypto` | `php -m` | [ ] |
| 2.4 | Рекомендации безопасности: `disable_functions` / `open_basedir` | Сверка с `resources/php.ini.recommended`; нет NOTICE «hardening incomplete» или принят риск | [ ] |

Ожидаемое при старте: NetherNet **не** пропущен с `pocketmine.server.transport.unavailable`. Если `transport.name: nethernet` только — без WebRTC сервер **не должен** стартовать (emergency).

---

## 3. Сеть и firewall

| # | Проверка | Как | OK |
|---|----------|-----|-----|
| 3.1 | **(BLOCKER)** TCP **19135** — signaling (или `builtin-signaling.port`) | `docker-compose` / хост firewall | [ ] |
| 3.2 | **(BLOCKER)** UDP для ICE: `port-range` или mux; в compose — **19135/19136** | `pocketmine.yml` `transport.nethernet` | [ ] |
| 3.3 | `nethernet.key` в бэкапе, права `0600` | `ls -l nethernet.key` | [ ] |
| 3.4 | За CGNAT — TURN в `ice-servers` (не `ice-udp-mux` + TURN вместе) | `docs/nethernet.md` | [ ] |
| 3.5 | Production TLS signaling или reverse-proxy + `reverse-proxy.enabled` | Нет plain HTTP trust loop в проде | [ ] |
| 3.6 | GS4 Query: порт query ≠ gameplay при включённом query (см. 5.51.1) | `server.properties` + лог старта | [ ] |

**Smoke:** join с **1.26.60** (основной), при необходимости — клиент со старым протоколом из вашей поддерживаемой вилки.

---

## 4. Конфиг `pocketmine.yml` (прод-разумные значения)

| # | Ключ | Рекомендация прода | Проверено |
|---|------|-------------------|-----------|
| 4.1 | `transport.name` | `nethernet` или явный `nethernet,raknet` на миграции | [ ] |
| 4.2 | `shutdown.drain-seconds` | `10`+ (не `0` на Docker) | [ ] |
| 4.3 | `abuse-limits.*` | `enabled: true` (чат/команды) | [ ] |
| 4.4 | `network.adaptive-qos` | `enabled: false` до теста; потом включать осознанно | [ ] |
| 4.5 | `session-recording` | `enabled: false` глобально; точечно `/sessionrecord` при разборе | [ ] |
| 4.6 | `world.save.fsync` | `true` | [ ] |
| 4.7 | `world.save.leveldb-sidecar` | по политике (monitoring only) | [ ] |
| 4.8 | `metrics.enabled` | `true` + scrape или `metrics.prom` | [ ] |
| 4.9 | `plugins.security-scan` | `true`, mode `warn` или `fail` | [ ] |
| 4.10 | `plugins.install.enabled` | `false` на публичном проде (или только ops) | [ ] |
| 4.11 | `ddui.enabled` | `true` только если нужен DDUI/MineChat push; иначе `false` | [ ] |

Живой файл: том `pocketmine.yml` в data path, не только `resources/pocketmine.yml`.

---

## 5. Resource packs и плагины

| # | Проверка | OK |
|---|----------|-----|
| 5.1 | `resource_packs.yml`: стеки лобби/арен; после правок — reconnect игроков | [ ] |
| 5.2 | `requires-capabilities` у плагинов совпадают с ядром (`form-api`, `multiworld-module`, …) | [ ] |
| 5.3 | `plugins/MultiWorld`, `plugins/WorldEdit` **не** дублируют встроенные модули (используете `plugins_backup` или удалили) | [ ] |
| 5.4 | DbDGame / MiniGameBase: API 5.x, symlink/volume в compose актуален | [ ] |
| 5.5 | `auth_keys_cache.json` есть или создастся; в бэкап data path | [ ] |

---

## 6. Функциональный smoke (после рестарта)

Минимум **15–20 минут**, 2 оператора (консоль + клиент).

### 6.1 База

| Шаг | Ожидание | OK |
|-----|----------|-----|
| Старт без emergency | TPS ~20, нет fatal | [ ] |
| `health.status` | `ok <tick> <ts>`, обновляется; Docker healthy | [ ] |
| `/status` | Rus-строки, транспорт `nethernet`, плагины enabled/total | [ ] |
| Join / quit | Без 30s зависания на auth (первый игрок после чистого рестарта) | [ ] |
| `/spawn`, `/world tp lobby` | MultiWorld в ядре | [ ] |

### 6.2 DbD / матч (ваш прод-контур)

| Шаг | OK |
|-----|-----|
| Меню → очередь → старт матча | [ ] |
| Клон/арена (`cloneWorld` или готовый мир) без игроков в template | [ ] |
| Генераторы / генератор repair / звуки (PlaySound handles) | [ ] |
| Конец матча, возврат в лобби, drain не ломает матч при `/stop` | [ ] |

### 6.3 DDUI (если `ddui.enabled: true`)

По `docs/DDUI_MANUAL_SMOKE.md` на **1.26.60**:

| Шаг | OK |
|-----|-----|
| `/ddui` → MessageBox, CustomForm, reactive | [ ] |
| Быстрая смена экранов (replace-delay) | [ ] |
| `sendForm()` vs `sendDduiForm()` — нет залипших экранов (MineChat) | [ ] |

### 6.4 Мультипротокол (если держите старых клиентов)

| Шаг | OK |
|-----|-----|
| Второй клиент другой версии из `ACCEPTED_PROTOCOL` заходит в лобби | [ ] |
| Чанки/блоки без массовых kick/decode errors в логе | [ ] |

---

## 7. Наблюдаемость и остановка

| # | Проверка | OK |
|---|----------|-----|
| 7.1 | SIGTERM / `stop` → drain → `stopping` в health → пустой сервер | [ ] |
| 7.2 | При инциденте: `/sessionrecord start <ник>` + `docs/session-recording.md` | [ ] |
| 7.3 | Диск: `session_recordings/`, `metrics.prom`, ротация при включённых метриках | [ ] |
| 7.4 | MySQL `servers_base` healthy (compose `depends_on`) | [ ] |

---

## 8. Откат

| # | Действие |
|---|----------|
| 8.1 | Сохранить предыдущий образ PHP runtime + commit ядра |
| 8.2 | Сохранить `nethernet.key`, `auth_keys_cache.json`, `pocketmine.yml`, миры |
| 8.3 | При откате protocol/data — откат **пары** `composer.lock` + `src/`, не только phar |
| 8.4 | План: остановить drain → backup worlds → swap commit → `composer install` → старт → smoke 6.1 |

---

## 9. Блокеры — не выкладывать, пока не закрыто

1. Нет `ext-webrtc` при `transport.name: nethernet`.
2. NetherNet не слушает снаружи (TCP/UDP).
3. `vendor/` или `composer.lock` не совпадают с деплоенным `src/`.
4. Критичный smoke DbD/лобби падает.
5. Незапланированный `dev-master` bump bedrock-protocol без регресс-теста join.

---

## Быстрая команда (хост)

```bash
cd /root/rubyxnet/rubyx-server
git rev-parse --short HEAD
composer show -s nethergamesmc/bedrock-protocol nethergamesmc/bedrock-data 2>/dev/null | rg 'versions|source'
docker compose ps
docker exec rubyx-server /data/runtime/bin/php7/bin/php -m | rg -i 'webrtc|pmmpthread|leveldb'
head -1 health.status 2>/dev/null || echo "health.status missing (server down?)"
```

---

*Чеклист для RubyxGames **5.52.0**; обновляйте при смене transport, DDUI или composer forks.*
