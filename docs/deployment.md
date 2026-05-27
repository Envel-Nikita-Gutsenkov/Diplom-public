# Руководство по развертыванию (Deployment Guide)

Проект полностью контейнеризирован и готов к production-эксплуатации на базе Docker.

## 1. Системные требования (System Requirements)

- **OS**: Ubuntu 22.04+ (рекомендуется) или любая система с Docker.
- **Resources**: Минимум 2GB RAM, 10GB Disk.
- **Dependencies**: Docker, Docker Compose v2.

## 2. Быстрый запуск (Quick Start)

Для запуска в production-режиме используйте готовый скрипт:

```bash
# 1. Склонируйте репозиторий
git clone https://github.com/Envel-Nikita-Gutsenkov/Diplom-public.git
cd Diplom-public

# 2. Подготовьте переменные окружения
cp .env.example .env

# 3. Запустите скрипт деплоя
./start.sh
```

`start.sh` автоматически:
1. Соберет production-образ приложения.
2. Поднимет контейнеры (App + PostgreSQL).
3. Применит миграции базы данных (`prisma db push`).
4. Запустит начальное сидирование (создание Admin-аккаунта).

---

## 3. Окружение (Environment Variables)

Обязательные переменные в `.env`:
- `DATABASE_URL`: Строка подключения к PostgreSQL (внутри сети Docker: `postgresql://admin:password@db:5432/olympiad`).
- `AUTH_SECRET`: Секретный ключ для шифрования сессий (сгенерируйте через `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Canonical URL приложения (напр., `https://olympiad.yourdomain.com`).

---

## 4. Обновление приложения (CI/CD)

Для обновления кода без потери данных в БД:

```bash
git pull origin main
./update-prod.sh
```

Этот скрипт пересоберет только контейнер приложения, выполнит миграции и перезапустит сервис, не затрагивая том (volume) базы данных.

## 5. Резервное копирование (Backups)

Резервные копии базы данных создаются автоматически и управляются через админ-панель. 
Файлы бэкапов хранятся в директории `backups/` в корне проекта на хост-машине (примонтировано к контейнеру).
