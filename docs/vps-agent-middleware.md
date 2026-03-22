# Middleware auf dem VPS: `agent.stress-test.net`

DNS: **A-Record** `agent` → **IPv4 deines VPS** (wie bei n8n).

Die App läuft in Docker nur auf **`127.0.0.1:3000`**; **nginx** macht **HTTPS** nach draußen.

---

## 1) Code auf den Server

```bash
sudo mkdir -p /opt/handwerker-ai
sudo chown -R $USER:$USER /opt/handwerker-ai
cd /opt/handwerker-ai
```

Repo hineinholen (Git **oder** per `scp`/`rsync` vom PC):

```bash
git clone https://github.com/DEIN_ORG/handwerker-ai.git .
# oder: Dateien aus C:\1PlumberAIvoice hochkopieren
```

---

## 2) `.env` auf dem Server

```bash
cd /opt/handwerker-ai
nano .env
```

Vorlage: `deploy/agent-vps/env.production.example`. Mindestens:

- `RETELL_API_KEY` (Retell, ggf. mit Webhook-Badge)
- `N8N_WEBHOOK_URL` (Production-URL aus n8n)
- `WEBHOOK_AUTH_TOKEN` (langer Zufallswert – nur für manuelle Tests ohne Retell-Signatur)

`PORT=3000` beibehalten (Container-Port; nginx spricht `127.0.0.1:3000` an).

---

## 3) Container bauen und starten

```bash
cd /opt/handwerker-ai
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl -sS http://127.0.0.1:3000/api/v1/health
```

Erwartung: JSON mit `"healthy"`.

---

## 4) nginx vHost

Datei aus dem Repo:

```bash
sudo cp /opt/handwerker-ai/deploy/agent-vps/nginx-agent.stress-test.net.conf \
  /etc/nginx/sites-available/agent.stress-test.net
sudo ln -sf /etc/nginx/sites-available/agent.stress-test.net /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5) TLS (Let’s Encrypt)

```bash
sudo certbot --nginx -d agent.stress-test.net
```

Danach: **https://agent.stress-test.net/api/v1/health**

---

## 6) Retell

Im Dashboard **Webhooks → URL**:

`https://agent.stress-test.net/api/v1/retell-webhook`

Kein Custom-Header nötig – Retell sendet **`x-retell-signature`**, das Backend prüft das mit `RETELL_API_KEY`.

---

## Nützlich

```bash
cd /opt/handwerker-ai
docker compose -f docker-compose.prod.yml logs -f --tail=100
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Firewall

UFW: **80** und **443** offen (hast du vermutlich schon für n8n). Port **3000** nach außen **nicht** öffnen – nur **127.0.0.1**.
