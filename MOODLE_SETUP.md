# Moodle Production Setup (`https://cet.iitp.ac.in/moodle`)

This guide sets up Moodle from scratch in Docker and publishes it at `https://cet.iitp.ac.in/moodle`.

## 1) Server Prerequisites

Run on your Linux server:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker
```

Open firewall ports:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 2) Configure Moodle Environment

From repo root:

```bash
cp .env.moodle.example .env.moodle
```

Edit `.env.moodle` and set strong values for:

1. `MOODLE_DB_ROOT_PASSWORD`
2. `MOODLE_DB_PASSWORD`
3. `MOODLE_ADMIN_PASSWORD`
4. `MOODLE_ADMIN_EMAIL`
5. `MOODLE_SITE_NAME`

Keep these values for your target URL:

```env
MOODLE_HOST=cet.iitp.ac.in
MOODLE_BASE_URL=https://cet.iitp.ac.in/moodle
MOODLE_HTTP_PORT=8080
```

## 3) Start Moodle Stack

```bash
docker compose --env-file .env.moodle -f docker-compose.moodle.yml pull
docker compose --env-file .env.moodle -f docker-compose.moodle.yml up -d
```

Check health:

```bash
docker compose --env-file .env.moodle -f docker-compose.moodle.yml ps
docker compose --env-file .env.moodle -f docker-compose.moodle.yml logs moodle --tail=100
```

## 4) Force Moodle Base URL to `/moodle`

Run after containers are healthy:

```bash
docker exec moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cfg.php --name=wwwroot --set="https://cet.iitp.ac.in/moodle"
docker exec moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cfg.php --name=reverseproxy --set=1
docker exec moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cfg.php --name=sslproxy --set=1
docker compose --env-file .env.moodle -f docker-compose.moodle.yml restart moodle
```

## 5) Configure Nginx Reverse Proxy

Copy [nginx/moodle-site.conf.example](nginx/moodle-site.conf.example) to server site config:

```bash
sudo cp nginx/moodle-site.conf.example /etc/nginx/sites-available/cet-moodle.conf
sudo ln -sf /etc/nginx/sites-available/cet-moodle.conf /etc/nginx/sites-enabled/cet-moodle.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 6) Enable HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d cet.iitp.ac.in
```

After certificate issuance, validate:

```bash
curl -I https://cet.iitp.ac.in/moodle/login/index.php
```

## 7) First-Run and Admin Access

1. Open `https://cet.iitp.ac.in/moodle`
2. Login with `MOODLE_ADMIN_USER` and `MOODLE_ADMIN_PASSWORD`
3. Immediately change admin password if temporary
4. Set cron job for Moodle tasks

Cron job example:

```bash
* * * * * docker exec -u daemon moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cron.php >/dev/null 2>&1
```

## 8) Full Reset (If You Need Fresh Install)

Warning: this deletes Moodle database and files.

```bash
docker compose --env-file .env.moodle -f docker-compose.moodle.yml down -v
docker volume rm moodlesecurity_moodle_db_data moodlesecurity_moodle_data moodlesecurity_moodle_moodledata 2>/dev/null || true
docker compose --env-file .env.moodle -f docker-compose.moodle.yml up -d
```

## Troubleshooting

1. `502 Bad Gateway`: confirm Moodle container is healthy and port `127.0.0.1:8080` responds
2. Wrong redirects to `/`: re-run the `cfg.php --name=wwwroot` command
3. Mixed content or http links: re-run `sslproxy` and `reverseproxy` commands
4. DB auth failure: verify `.env.moodle` passwords for both `moodle-db` and `moodle`
