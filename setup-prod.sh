#!/bin/bash
set -e

# ==============================================================================
# Olympiad App - Automated Production Setup Script
# ==============================================================================
# Этот скрипт автоматически настраивает Nginx, SSL и запускает Docker контейнеры.
# Запускать скрипт нужно с правами root (sudo).

if [ "$EUID" -ne 0 ]; then
  echo "Пожалуйста, запустите скрипт с правами root (sudo ./setup-prod.sh)"
  exit 1
fi

echo "=========================================="
echo " Шаг 1: Конфигурация параметров"
echo "=========================================="

# Функция для запроса значения с дефолтным
ask() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    read -p "$prompt [$default]: " input
    if [ -z "$input" ]; then
        eval $var_name="$default"
    else
        eval $var_name="$input"
    fi
}

ask "Введите ВАШ ДОМЕН или ПОДДОМЕН для приложения (например: app.mysite.com или mysite.com)" "app.mysite.com" DOMAIN_NAME
ask "Введите Email для SSL сертификата Let's Encrypt" "admin@$DOMAIN_NAME" EMAIL
ask "Введите внутренний порт приложения" "3000" APP_PORT

echo ""
echo "Сводка параметров:"
echo "Домен/Поддомен: $DOMAIN_NAME"
echo "Email: $EMAIL"
echo "Порт приложения: $APP_PORT"
read -p "Всё верно? Продолжить установку? (y/n) [y]: " CONFIRM
CONFIRM=${CONFIRM:-y}

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" && "$CONFIRM" != "yes" ]]; then
    echo "Установка отменена."
    exit 0
fi

echo "=========================================="
echo " Шаг 2: Настройка .env файла"
echo "=========================================="

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Создаем файл .env из шаблона .env.example..."
    cp .env.example .env
    
    # Генерация паролей
    AUTH_SECRET=$(openssl rand -base64 32)
    DB_PASS=$(openssl rand -hex 16)
    
    # Обновляем .env
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN_NAME|g" .env
    sed -i "s|AUTH_SECRET=.*|AUTH_SECRET=$AUTH_SECRET|g" .env
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$DB_PASS|g" .env
    sed -i "s|PORT=.*|PORT=$APP_PORT|g" .env
    
    echo "Файл .env сгенерирован со случайными паролями."
  else
    echo "Ошибка: Шаблон .env.example не найден."
    exit 1
  fi
else
  echo "Файл .env уже существует, используем его."
  grep -q "NEXTAUTH_URL=" .env && sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN_NAME|g" .env || echo "NEXTAUTH_URL=https://$DOMAIN_NAME" >> .env
  grep -q "PORT=" .env && sed -i "s|PORT=.*|PORT=$APP_PORT|g" .env || echo "PORT=$APP_PORT" >> .env
fi

echo "=========================================="
echo " Шаг 3: Установка Nginx и Certbot"
echo "=========================================="
apt-get update
if ! command -v nginx >/dev/null 2>&1; then
    apt-get install -y nginx
fi
if ! command -v certbot >/dev/null 2>&1; then
    apt-get install -y certbot python3-certbot-nginx
fi

echo "=========================================="
echo " Шаг 4: Настройка Nginx (Reverse Proxy)"
echo "=========================================="

# Название файла конфига будет совпадать с доменом для удобства
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"

# Создаем конфигурацию Nginx (убрали www, так как для поддоменов он не нужен)
cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Активируем конфигурацию
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

if [ -f /etc/nginx/sites-enabled/default ]; then
  rm /etc/nginx/sites-enabled/default
fi

# Проверка и перезапуск Nginx
nginx -t
systemctl restart nginx

echo "=========================================="
echo " Шаг 5: Настройка SSL сертификата (HTTPS)"
echo "=========================================="
if [ "$DOMAIN_NAME" != "app.mysite.com" ]; then
    certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL --redirect || echo "Не удалось получить SSL. Проверьте A-записи домена."
else
    echo "Пропуск настройки SSL (использован дефолтный поддомен app.mysite.com, его нет в DNS)."
fi

# 6. Запуск Docker контейнеров
echo "=========================================="
echo " Шаг 6: Запуск Docker контейнеров"
echo "=========================================="
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build --remove-orphans

# Синхронизация пароля БД (на случай, если волюм уже был, а пароль в .env новый)
echo "Синхронизация пароля базы данных..."
# Ждем немного, чтобы Postgres успел стартовать
sleep 5

DB_USER=$(grep "POSTGRES_USER=" .env | cut -d'=' -f2)
DB_PASS=$(grep "POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
DB_NAME=$(grep "POSTGRES_DB=" .env | cut -d'=' -f2)

# Используем docker exec для смены пароля. 
# Мы заходим под суперпользователем postgres (в alpine он есть по умолчанию), чтобы сбросить пароль нашему юзеру.
docker exec olympiad_db_prod psql -U postgres -d $DB_NAME -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" || \
docker exec olympiad_db_prod psql -U $DB_USER -d $DB_NAME -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" || \
echo "Не удалось автоматически синхронизировать пароль. Если возникнет ошибка P1000, введите пароль вручную."

echo "=========================================="
echo "Установка успешно завершена!"
echo "=========================================="
if [ "$DOMAIN_NAME" != "app.mysite.com" ]; then
    echo "Приложение доступно по адресу: https://$DOMAIN_NAME"
else
    echo "Приложение доступно локально на порту $APP_PORT"
fi
echo "------------------------------------------"
echo ""
echo "Сгенерированные доступы (из .env):"
cat .env | grep -E "AUTH_SECRET|POSTGRES_PASSWORD"
echo "------------------------------------------"
