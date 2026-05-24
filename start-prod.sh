#!/bin/bash
set -e

echo "=========================================="
echo "  Olympiad App - Production Start"
echo "=========================================="

if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please run: cp .env.example .env"
  echo "Then edit .env and configure the secure passwords before starting."
  exit 1
fi

echo "[1/2] Building and Starting Services..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build --remove-orphans
echo "[1/2] Синхронизация схемы БД..."
$DOCKER_COMPOSE -f docker-compose.prod.yml exec -T app npx prisma db push --accept-data-loss

echo "[2/2] Waiting for Application and Migrations..."
sleep 15

echo "[2/2] Очистка старых неупотребляемых образов Docker..."
docker image prune -a -f
docker builder prune -a -f

echo ""
echo "[OK] Production environment is starting!"
echo "To view app logs run: $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f app"
echo "------------------------------------------"
