# n8n auf dem VPS installieren (Ubuntu, Docker, HTTPS)

Voraussetzungen:

- VPS mit **Ubuntu 22.04 oder 24.04** (Hetzner passt).
- **Domain oder Subdomain**, z. B. `n8n.deinedomain.de`, als **A-Record** auf die **öffentliche IPv4** des VPS (bei Hetzner: Server-IP im Cloud-Panel).
- SSH-Zugang (Passwort oder besser SSH-Key).

---

## 1) Per SSH einloggen

```bash
ssh root@DEINE_SERVER_IP
```

Falls du einen anderen User nutzt: `ssh deinuser@DEINE_SERVER_IP` und bei Bedarf `sudo -i`.

---

## 2) System aktualisieren

```bash
apt update && apt upgrade -y
```

---

## 3) Docker installieren (offizielle Docker-Pakete für Ubuntu)

```bash
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME:-$UBUNTU_CODENAME}") stable" \
> /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Prüfen:

```bash
docker --version
docker compose version
```

---

## 4) Firewall (UFW) — SSH nicht abschließen

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Wenn du **Hetzner Cloud Firewall** nutzt: dort ebenfalls **22, 80, 443** zur Server-IP freigeben.

---

## 5) Projektordner auf dem Server

Die Dateien liegen in deinem Repo unter `deploy/n8n-vps/`. Auf dem Server:

**Option A — per `scp` vom PC (PowerShell, im Ordner mit den Dateien):**

```powershell
scp -r deploy\n8n-vps root@DEINE_SERVER_IP:/opt/n8n
```

**Option B — auf dem Server manuell:**

```bash
mkdir -p /opt/n8n
cd /opt/n8n
```

Dann `docker-compose.yml`, `Caddyfile` und `.env` nach `/opt/n8n` legen (Inhalt aus dem Repo kopieren).

---

## 6) Caddyfile und .env anpassen

```bash
cd /opt/n8n
cp Caddyfile.example Caddyfile
nano Caddyfile
```

Ersetze `n8n.deinedomain.de` durch deine echte Subdomain (DNS muss schon auf die VPS-IP zeigen).

```bash
cp env.example .env
nano .env
```

- `N8N_HOST` = **dieselbe** Domain wie in der ersten Zeile des `Caddyfile` (ohne `https://`).
- `N8N_ENCRYPTION_KEY` erzeugen:

```bash
openssl rand -hex 32
```

Den Wert in `.env` bei `N8N_ENCRYPTION_KEY=` eintragen. **Sicher aufbewahren** — ohne diesen Key sind gespeicherte n8n-Credentials nicht mehr nutzbar.

---

## 7) Container starten

```bash
cd /opt/n8n
docker compose up -d
docker compose ps
docker compose logs -f --tail=50
```

---

## 8) n8n im Browser öffnen

`https://DEINE_SUBDOMAIN` (z. B. `https://n8n.deinedomain.de`)

Beim ersten Besuch **Owner-Account** anlegen.

---

## 9) Webhook-URL für Handwerker-AI (`N8N_WEBHOOK_URL`)

1. In n8n: **Workflow** → Node **Webhook**.
2. **HTTP Method:** `POST`, **Path:** z. B. `retell`.
3. Workflow **speichern** und **aktivieren** (Schalter „Active“).
4. Im Webhook-Node die **Production URL** kopieren — sie beginnt mit `https://deine-subdomain/webhook/...`.
5. Diese komplette URL in die `.env` deines Backends als `N8N_WEBHOOK_URL` eintragen.

---

## Nützliche Befehle

```bash
cd /opt/n8n
docker compose logs -f n8n
docker compose restart
docker compose pull && docker compose up -d
```

---

## Variante B: nginx bleibt (kein Caddy-Container)

Wenn **Port 80/443 schon von nginx** belegt ist: n8n läuft nur auf **127.0.0.1:5678**, **HTTPS** macht **nginx**.

### B1) Alten Stack stoppen (Caddy + ggf. fehlgeschlagener Start)

```bash
cd /opt/n8n
docker compose down
```

### B2) Neue Compose-Datei nutzen

Datei `docker-compose.nginx.yml` aus dem Repo nach `/opt/n8n` kopieren (gleicher Ordner wie `.env`).

```bash
cd /opt/n8n
docker compose -f docker-compose.nginx.yml up -d
docker compose -f docker-compose.nginx.yml ps
```

`.env` unverändert: `N8N_HOST` = deine Subdomain (z. B. `n8n.stress-test.net`), `N8N_ENCRYPTION_KEY` wie zuvor.

**Caddyfile** wird bei dieser Variante **nicht** gebraucht.

### B3) nginx-VirtualHost

```bash
sudo cp /opt/n8n/nginx-n8n.conf.example /etc/nginx/sites-available/n8n.stress-test.net
sudo nano /etc/nginx/sites-available/n8n.stress-test.net
```

`server_name` auf deine echte Domain setzen (muss zu `N8N_HOST` in `.env` passen).

```bash
sudo ln -sf /etc/nginx/sites-available/n8n.stress-test.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### B4) TLS (Let’s Encrypt)

Falls für diese Subdomain noch **kein** Zertifikat existiert:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d n8n.stress-test.net
```

(Domain anpassen.) Danach erneut `https://…` im Browser testen.

### B5) n8n mit nginx

- Editor & Webhooks: **`https://n8n.stress-test.net`**
- `N8N_WEBHOOK_URL` im Backend = exakt die **Production URL** aus dem Webhook-Node (beginnt mit `https://…`).

---

## Debian statt Ubuntu?

Docker-Repo für Debian: [Docker Docs – Debian](https://docs.docker.com/engine/install/debian/) — Schritte analog, Repository-URL anpassen.
