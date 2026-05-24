#!/bin/bash
set -e

# ==============================================================================
# Olympiad App - Production Packager
# ==============================================================================
# Этот скрипт создает ZIP-архив только с теми файлами, которые необходимы
# для сборки и развертывания проекта на production-сервере.
# Он исключает тяжелые папки (.git, node_modules, .next и т.д.)

ARCHIVE_NAME="diplom-prod-$(date +%Y%m%d_%H%M).zip"

echo "Удаление старых архивов (если есть)..."
rm -f diplom-prod-*.zip

echo "Создание архива $ARCHIVE_NAME..."

# Используем git archive, если проект в git, так как он автоматически уважает .gitignore
# Но так как нам, возможно, нужны еще какие-то файлы, которые мы могли не добавить,
# воспользуемся классическим zip-архиватором с ключами исключения.

# Проверяем наличие команды zip
if ! command -v zip >/dev/null 2>&1; then
    echo "Ошибка: Утилита 'zip' не установлена."
    echo "Для Windows установите Git Bash / WSL, либо воспользуйтесь PowerShell скриптом."
    exit 1
fi

zip -r -q "$ARCHIVE_NAME" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".next/*" \
  -x "coverage/*" \
  -x "test-results/*" \
  -x "playwright-report/*" \
  -x ".env" \
  -x ".env.local" \
  -x "start.sh" \
  -x "start.bat" \
  -x "docker-compose.yml" \
  -x "*.zip"

echo "=========================================="
echo "[OK] Готово!"
echo "Архив создан: $ARCHIVE_NAME"
echo "Размер архива: $(du -sh "$ARCHIVE_NAME" | cut -f1)"
echo "=========================================="
echo "Теперь вы можете отправить этот архив на сервер (например, через SCP или SFTP):"
echo "scp $ARCHIVE_NAME user@your-server-ip:~/"
