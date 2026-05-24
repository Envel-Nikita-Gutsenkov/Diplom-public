@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   Olympiad App - Production Start (Windows)
echo ==========================================

:: 1. Проверка наличия docker compose (предпочитаем современный v2 плагин)
docker compose version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

if not exist ".env" (
  echo Error: .env file not found!
  echo Please run: copy .env.example .env
  echo Then edit .env and configure the secure passwords before starting.
  exit /b 1
)

echo [1/2] Building and Starting Services...
%DOCKER_COMPOSE% -f docker-compose.prod.yml up -d --build --remove-orphans

echo [2/2] Waiting for Application and Migrations...
timeout /t 15 /nobreak

echo [2/2] Очистка старых неупотребляемых образов Docker...
docker image prune -a -f
docker builder prune -a -f

echo.
echo [OK] Production environment is starting!
echo To view app logs run: %DOCKER_COMPOSE% -f docker-compose.prod.yml logs -f app
echo ------------------------------------------
