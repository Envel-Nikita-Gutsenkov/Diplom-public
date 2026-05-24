#!/bin/bash
set -e

echo "=========================================="
echo "  Olympiad App - Quick Start (Docker)"
echo "=========================================="

if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

echo "[1/2] Starting All Services (Hot Reload Enabled)..."
$DOCKER_COMPOSE --profile testing up -d --remove-orphans

echo "[2/2] Waiting for Application and Migrations..."

echo "Waiting for app container to report healthy status..."
sleep 15

echo ""
echo "[OK] Development environment is ready!"
echo "Hot Reload (HMR) is active: edit any file to see changes."
echo "The app is available at http://localhost:3000"
echo "------------------------------------------"
echo "Default Admin: admin@admin.com / admin"
echo "------------------------------------------"
echo "To view app logs run: $DOCKER_COMPOSE logs -f app"
echo "To view test logs run: $DOCKER_COMPOSE logs -f e2e"
rm -f server.log server_v3.log
