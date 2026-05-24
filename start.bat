@echo off
chcp 65001 >nul
echo ==========================================
echo   Olympiad App - Quick Start (Docker)
echo ==========================================

:: 1. Проверка наличия docker compose (предпочитаем современный v2 плагин)
docker compose version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

echo [1/2] Starting All Services (Hot Reload Enabled)...
%DOCKER_COMPOSE% --profile testing up -d --remove-orphans

echo [2/2] Waiting for Application and Migrations...
rem Building state and running migrations inside container...

timeout /t 10 /nobreak >nul

echo.
echo [OK] Development environment is ready!
echo Hot Reload (HMR) is active: edit any file to see changes.
echo The app is available at http://localhost:3000
echo ------------------------------------------
echo Default Admin: admin@admin.com / admin
echo ------------------------------------------
echo To view app logs run: %DOCKER_COMPOSE% logs -f app
echo To view test logs run: %DOCKER_COMPOSE% logs -f e2e
del server.log >nul 2>&1
del server_v3.log >nul 2>&1

docker image prune -f
