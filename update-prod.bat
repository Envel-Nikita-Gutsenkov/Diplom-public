@echo off
setlocal

:: ==============================================================================
:: Olympiad App - Safe Production Update Script (Windows)
:: ==============================================================================
:: Этот скрипт безопасно обновляет приложение до последней версии (уже загруженной)
:: и перезапускает контейнеры без потери данных в БД.

echo ==========================================
echo  [START] Начинаем обновление приложения...
echo ==========================================

:: 1. Проверка наличия docker compose (предпочитаем современный v2 плагин)
docker compose version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

:: 2. Пересобираем и перезапускаем только нужные контейнеры
echo [BUILD] Пересборка контейнеров (это может занять пару минут)...
%DOCKER_COMPOSE% -f docker-compose.prod.yml up -d --build --remove-orphans
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ошибка при сборке или запуске контейнеров!
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Применяем миграции БД
echo [DB] Проверка и применение миграций базы данных...
%DOCKER_COMPOSE% -f docker-compose.prod.yml exec app npx prisma migrate deploy

:: 4. Очистка старых образов
echo [CLEAN] Очистка старых образов и кэша сборки...
docker image prune -f

echo ==========================================
echo [DONE] Обновление успешно завершено!
echo Приложение доступно на порту 3000 (или указанном в .env)
echo ==========================================
pause
