# 404 auf `https://agent.stress-test.net/api/v1/health`

## Schritt 1: Node direkt testen (ohne nginx)

```bash
curl -sS -i http://127.0.0.1:3000/api/v1/health | head -15
```

- **200 + JSON** → App ok, nur **nginx/HTTPS** falsch.
- **Connection refused** → Docker prüfen:  
  `cd /opt/handwerker-ai && docker compose -f docker-compose.prod.yml ps`

## Schritt 2: Welche nginx-Config gilt für die Domain?

```bash
sudo nginx -T 2>/dev/null | grep -n "server_name agent.stress-test.net" -A40
```

Im Block für **`listen 443`** muss stehen:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    ...
}
```

Wenn dort stattdessen **`root /var/...`** oder **`try_files`** steht → **404** trotz laufender App.

## Schritt 3: Fix – HTTPS-Block mit proxy_pass

Zertifikat muss existieren:

```bash
sudo ls /etc/letsencrypt/live/agent.stress-test.net/
```

Dann Config aus dem Repo übernehmen (Pfade anpassen, falls certbot andere Namen nutzt):

```bash
sudo nano /etc/nginx/sites-available/agent.stress-test.net
```

Vorlage: `deploy/agent-vps/nginx-agent.stress-test.net-https.conf` (Redirect 80→443 + SSL + `proxy_pass`).

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sS -i https://agent.stress-test.net/api/v1/health | head -15
```

## Schritt 4: Noch kein Zertifikat?

Nur HTTP-Config (Port 80) mit `proxy_pass` aktiv lassen, **kein** SSL:

```bash
sudo certbot --nginx -d agent.stress-test.net
```

Danach **Schritt 2** wiederholen – certbot ändert Dateien; manchmal fehlt `proxy_pass` im neuen SSL-Block.
