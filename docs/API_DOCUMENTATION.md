# Документация API и Серверных Действий (Server Actions)

В проекте DiplomSoft2 вместо традиционного REST API для взаимодействия с данными преимущественно используются **Server Actions**. Это обеспечивает полную типобезопасность (TypeScript) и упрощает разработку.

## 1. Аутентификация (Auth.js)

Аутентификация реализована через Auth.js (NextAuth v5). Основные эндпоинты API (`/api/auth/*`) обрабатываются библиотекой автоматически.

### Защита маршрутов (Middleware)
Маршруты защищены в `middleware.ts` (стандарт Next.js):
- **Админ-панель** (`/admin/*`): Доступна только пользователям с `Role = ADMIN`.
- **Личный кабинет** (`/dashboard/*`): Доступен всем авторизованным пользователям.

---

## 2. Основные Server Actions

Все экшены расположены в `app/actions/` и поддерживают паттерн "Zero-Crash" (обернуты в try/catch).

### Olympiad Actions (olympiad.ts)
Управление олимпиадами и задачами.

- `createOlympiad(data)`: Создание новой олимпиады. Валидация через Zod.
- `updateOlympiad(id, data)`: Редактирование параметров и анти-чит настроек.
- `deleteOlympiad(id)`: Удаление олимпиады и связанных задач (Cascade delete в БД).
- `getOlympiadById(id, userId?)`: Получение данных олимпиады. Если указан `userId`, включает submissions этого пользователя для восстановления состояния.
- `toggleOlympiadStatus(id)`: Быстрое переключение активности (`isActive`).
- `updateOlympiadTasks(id, questionsJson)`: Групповое обновление задач олимпиады.
- `updateOlympiadSettings(id, data)`: Редактирование только метаданных (без задач).
- `addTask(olympiadId, data)`: Добавление одиночной задачи.
- `getOlympiads()`: Список всех олимпиад.
- `getActiveOlympiads()`: Список олимпиад, открытых для участия в данный момент.
- `resetResults(id)`: Сброс всех результатов и ответов для олимпиады.
- `resetUserResult(olympiadId, userId)`: Удаление результата конкретного участника.
- `voidUserResult(olympiadId, userId)`: Аннулирование работы участника (баллы в 0, статус "дисквалифицирован").

### Submission Actions (submission.ts)
Обработка ответов участников.

- `submitAnswer(taskId, answer)`: Сохранение или обновление ответа пользователя. Использует дебаунсинг на клиенте.
- `startOlympiad(olympiadId)`: Инициализация участия, фиксация `startedAt` и проверка лимита времени.
- `finishOlympiad(olympiadId)`: Фиксация завершения олимпиады. Автоматически проверяет ответы (тесты) и рассчитывает баллы.

### User Actions (users.ts)
Управление профилями и доступом.

- `updateUserRole(userId, role)`: Изменение прав пользователя (Admin only).
- `getAllUsers()`: Получение списка всех пользователей.
- `updateUserProfile(userId, data)`: Изменение метаданных (имя, группа, теги).
- `createUser(data)`: Ручное создание пользователя администратором.
- `deleteUser(userId)`: Полное удаление аккаунта пользователя.
- `updateUserPassword(userId, password)`: Принудительная смена пароля администратором.

### Settings Actions (settings.ts)
Глобальные настройки системы.

- `updateGlobalSettings(settings)`: Включение/выключение регистрации.
- `updateBackupSettings(data)`: Настройка автоматических бэкапов и их глубины.
- `checkAutoBackup()`: Пассивная проверка необходимости создания бэкапа по расписанию.
- `updateUserGroup(group)`: Смена учебной группы пользователем.
- `updateUserPassword({current, new})`: Самостоятельная смена пароля через личный кабинет.

### Analytics Actions (analytics.ts)
Просмотр статистики и результатов (для админов).

- `getOlympiadResults(olympiadId)`: Получение таблицы лидеров и общей статистики.
- `getUserOlympiadStats(userId, olympiadId)`: Детальный отчет по участнику (ответы, баллы, нарушения).

### Result Actions (result.ts)
Доступ пользователя к своим работам.

- `getUserResults()`: Список всех пройденных олимпиад со статусом проверки.
- `getUserResultDetail(resultId)`: Просмотр своих ответов и баллов после завершения.

### Grading Actions (grading.ts)
Ручная проверка (для админов).

- `updateSubmissionGrade(submissionId, isCorrect, score)`: Установка оценки за открытые вопросы или код. Пересчитывает `totalScore` в результате.

### Violation Actions (violations.ts)
Система анти-чита.

- `logViolation(olympiadId, type, taskId?)`: Запись подозрительного события в логи Submission или Result.

---

## 3. Обработка Ошибок и Валидация

### Валидация (Zod)
Каждый экшен начинается с проверки входных данных:
```typescript
const validatedFields = schema.safeParse(formData);
if (!validatedFields.success) {
  return { error: "Некорректные данные" };
}
```

### Формат ответа
Все Server Actions возвращают унифицированный объект:
- Успех: `{ success: true, data: ... }`
- Ошибка: `{ error: "Описание ошибки для UI" }`

---

## 4. База Данных

Для прямого взаимодействия с данными используется Prisma Client (`lib/prisma.ts`).
Типы для всех сущностей генерируются автоматически на основе `schema.prisma`.
