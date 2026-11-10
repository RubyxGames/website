# Resource packs

## Formats

- `.zip` / `.mcpack`
- Folder with `manifest.json` (auto-zipped into `compress_cache_dir`)

Originals under `resource_packs/` are never modified.

## Stacks

`resource_stack` is the global default.

**World stacks** (`world_stacks.<folder>`): at login the server offers the stack for the **default world** folder name if configured; otherwise the global stack. Plugins can use `ResourcePackManager::getResourceStackForWorld()` / `getNamedStack()`.

**Important:** Bedrock cannot hot-swap resource packs mid-session. After `/resourcepacks reload` or a world transfer, players must **reconnect** to receive a different stack.

## CDN (#10)

```yaml
cdn_urls:
  <pack-uuid-or-filename>: "https://cdn.example.com/pack.zip"
```

URLs are sent in `ResourcePacksInfoPacket`. Keep local packs for clients that fall back to chunk download. Plugins may override URLs via `PlayerResourcePackOfferEvent::setCdnUrls()`.

## Unchanged packs / client cache (#11)

There is no custom binary-diff protocol. Clients skip re-download when pack **UUID + version** match what they already have.

- Folder/zip compression cache invalidates on file stamp changes.
- On reload, the server logs when a pack's uuid|version|sha256 fingerprint changed.
- For tiny texture edits: bump the pack **version** in `manifest.json` when you want clients to re-download; keep the same UUID.

`ResourcePackManager::getPackContentFingerprint(ResourcePack)` returns `uuid|version|sha256hex`.

## Encryption (#13)

- Place `<pack>.key` next to the pack (exactly **32 bytes**), or:
  ```yaml
  resource_stack:
    - pack: secret.zip
      key_file: secret.zip.key
  ```
- Successful encrypted packs log `Encrypted resource pack "..." (uuid=...)`.
- If a `.key` exists but the pack fails to load, a warning is logged.

## Hot-reload (#14)

```
/resourcepacks reload
```

Permission: `pocketmine.command.resourcepacks`. Reloads YAML + packs in place. Online players are not updated until they reconnect.

## Send tuning

`pack_chunk_size_kb` and `pack_chunk_concurrency` control how pack bytes are streamed to the client.
