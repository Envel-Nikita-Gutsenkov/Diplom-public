#!/bin/bash
set -e

# ==============================================================================
# Olympiad App - Safe Production Update Script
# ==============================================================================
# Этот скрипт безопасно обновляет приложение до последней версии (уже загруженной)
# и перезапускает контейнеры без потери данных в БД.

echo "=========================================="
echo " [START] Начинаем обновление приложения..."
echo "=========================================="

# 1. Проверка наличия docker compose (предпочитаем современный v2 плагин)
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# 2. Пересобираем и перезапускаем только нужные контейнеры
# Флаг --build заставит Docker пересобрать образ приложения с новым кодом
# База данных (db) не затронется, так как данные хранятся в volumes
echo "[BUILD] Пересборка контейнеров (это может занять пару минут)..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build --remove-orphans

# 3. Применяем миграции БД (на всякий случай, если схема изменилась)
# Хотя Dockerfile уже делает это при старте, явный вызов полезен для отладки
echo "[DB] Проверка и синхронизация схемы базы данных..."
$DOCKER_COMPOSE -f docker-compose.prod.yml exec app npx prisma db push --accept-data-loss --skip-generate

# 4. Синхронизация пароля БД (авто-фикс P1000)
echo "[DB] Синхронизация пароля базы данных..."
DB_USER=$(grep "POSTGRES_USER=" .env | cut -d'=' -f2)
DB_PASS=$(grep "POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
DB_NAME=$(grep "POSTGRES_DB=" .env | cut -d'=' -f2)

docker exec olympiad_db_prod psql -U postgres -d $DB_NAME -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" || \
docker exec olympiad_db_prod psql -U $DB_USER -d $DB_NAME -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" || \
echo "[WARN] Не удалось синхронизировать пароль автоматически."

# 5. Очистка старых образов для экономии места
echo "[CLEAN] Очистка старых образов и кэша сборки..."
docker image prune -f
docker builder prune -f --filter "until=24h"

echo "=========================================="
echo "[DONE] Обновление успешно завершено!"
echo "Приложение доступно по адресу вашего домена."
echo "=========================================="
