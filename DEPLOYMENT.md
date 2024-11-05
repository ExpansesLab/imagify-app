# Инструкция по деплою приложения на Ubuntu

## Предварительные требования

1. Ubuntu 22.04 LTS
2. Node.js 18+ и npm
3. PostgreSQL 14+
4. Nginx
5. PM2 для управления процессами
6. SSL сертификат (Let's Encrypt)
7. Docker (опционально)

## 1. Подготовка сервера

```bash
# Обновление системы и установка базовых утилит
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git software-properties-common

# Установка Node.js 18 с помощью NVM для гибкого управления версиями
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Установка глобальных npm пакетов
npm install -g pm2 pnpm

# Установка Nginx
sudo apt install -y nginx

# Установка PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Установка Docker (опционально)
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

## 2. Настройка PostgreSQL

```bash
# Создание базы данных и пользователя
sudo -u postgres psql <<EOF
CREATE DATABASE imagify_db;
CREATE USER imagify_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE imagify_db TO imagify_user;
\c imagify_db
GRANT ALL ON SCHEMA public TO imagify_user;
EOF
```

## 3. Подготовка проекта

```bash
# Клонирование репозитория
git clone https://github.com/your-repo/imagify.git
cd imagify

# Установка зависимостей
pnpm install

# Генерация Prisma клиента
pnpm prisma generate

# Применение миграций
pnpm prisma migrate deploy
```

## 4. Настройка переменных окружения

Создайте файл `.env.production`:

```env
# База данных
DATABASE_URL="postgresql://flux_user:your_strong_password@localhost:5432/flux_ai_db?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"

# Другие переменные (AWS, YooKassa, etc.)
# Используйте сложные уникальные значения
```

## 5. Сборка и запуск приложения

```bash
# Сборка приложения
pnpm build

# Запуск через PM2
pm2 start npm --name "imagify" -- run start
pm2 startup
pm2 save
```

## 6. Настройка Nginx с SSL

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Создание конфигурации Nginx
sudo nano /etc/nginx/sites-available/imagify

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/imagify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com
```

## 7. Автоматизация обновлений

Создайте скрипт `deploy.sh`:

```bash
#!/bin/bash
cd /path/to/imagify
git pull
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pm2 restart imagify
```

Сделайте скрипт исполняемым:
```bash
chmod +x deploy.sh
```

## 8. Мониторинг и безопасность

```bash
# Мониторинг логов
pm2 logs imagify

# Настройка файрвола
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Настройка автоматических обновлений
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 9. Резервное копирование

```bash
# Создание бэкапа базы данных
pg_dump -U flux_user flux_ai_db | gzip > /backup/flux_ai_db_$(date +%Y%m%d).sql.gz
```

## Дополнительные рекомендации

1. Используйте сложные уникальные пароли
2. Настройте двухфакторную аутентификацию
3. Регулярно обновляйте систему и зависимости
4. Мониторьте системные ресурсы
5. Настройте логирование и alerts

## Troubleshooting

- Проверьте логи PM2: `pm2 logs`
- Проверьте статус Nginx: `sudo systemctl status nginx`
- Проверьте логи Nginx: `sudo tail -f /var/log/nginx/error.log`
