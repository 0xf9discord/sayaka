# Sayaka Discord Bot (Bun + Discord.js)

## Debian setup

```bash
bun install
cp .env.example .env
nano .env  # Fill in actual credentials. Never publish this file.
bun run deploy
bun run start
```

Commands: `/핑` and `/notify_all` (administrator-only; requires explicit `confirm: true`).

To register updated slash commands, rerun `bun run deploy`.

## Run in the background (systemd, no Node.js/PM2 required)

```bash
which bun
```

Use the actual Bun path and username when customizing `sayaka.service.example`. Copy the service file to `/etc/systemd/system/sayaka.service`, then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sayaka
sudo systemctl status sayaka
journalctl -u sayaka -f
```

The Discord Developer Portal > Bot > **Server Members Intent** must be enabled for `/notify_all` to fetch member lists.

**Important:** Mass DMs can trigger Discord anti-spam enforcement. Only notify members who expect and consent to these messages. Large servers can also exceed Discord interaction response lifetime; use a persistent queue for production-scale sends.
