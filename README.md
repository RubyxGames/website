# RubyxGames documentation site

- **База:** полная копия [axolotl-pm/website](https://github.com/axolotl-pm/website) → `docs/` (64+ страниц).
- **Дополнение:** `docs/rubyx/` — markdown из `rubyx-server/docs/`.

## Команды

```bash
pnpm install
pnpm docs:dev
pnpm docs:build
```

Обновить upstream Axolotl и ваши docs:

```bash
pnpm sync:axolotl-docs
# затем вручную восстановить docs/rubyx/index.md, installation.md и правки в docs/index.md при необходимости
```

См. [docs/ATTRIBUTION.md](./docs/ATTRIBUTION.md).

## Деплой

GitHub Pages — workflow `.github/workflows/deploy.yml` (как у Axolotl).
