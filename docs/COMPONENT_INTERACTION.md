# Взаимодействие Компонентов и Сценарии

В данном документе описаны основные процессы взаимодействия между клиентом, сервером и базой данных на примере конкретных сценариев использования.

## 1. Сценарий: Участие в Олимпиаде

Процесс от входа в олимпиаду до завершения.

```mermaid
sequenceDiagram
    participant UI as Dashboard (Client)
    participant SA as Olympiad Action (Server)
    participant DB as PostgreSQL
    
    UI->>SA: enterOlympiad(olympiadId)
    SA->>DB: Check if Olympiad is active
    SA->>DB: Check if Result exists for User
    alt Новый участник
        SA->>DB: Create Result (startedAt: now)
    end
    SA-->>UI: Return Result & First Tasks
    
    UI->>SA: submitTask(taskId, answer)
    SA->>DB: Save Submission
    SA->>SA: Auto-grade (if possible)
    SA-->>UI: Success Acknowledgement
    
    UI->>SA: finishOlympiad(resultId)
    SA->>DB: Update Result (finishedAt: now, isSubmitted: true)
    SA-->>UI: Show Final Score
```

## 2. Сценарий: Аутентификация

Безопасный вход пользователя.

```mermaid
sequenceDiagram
    participant Form as LoginForm (Client)
    participant NextAuth as NextAuth.js
    participant Logic as auth.ts (Server)
    participant DB as PostgreSQL
    
    Form->>NextAuth: signIn("credentials", { email, password })
    NextAuth->>Logic: authorize() callback
    Logic->>DB: findUserByEmail(email)
    DB-->>Logic: User Data & Hashed Password
    Logic->>Logic: bcrypt.compare(password, hash)
    alt Успех
        Logic-->>NextAuth: User Object
        NextAuth-->>Form: Redirect to /dashboard
    else Ошибка
        Logic-->>Form: Error "Invalid Credentials"
    end
```

## 3. Сценарий: Управление Олимпиадой (Админ)

```mermaid
graph LR
    Admin[Admin UI] -->|Update Settings| SettingsSA[settings.ts]
    Admin -->|Manage Olympiads| OlympiadSA[olympiad.ts]
    Admin -->|User Management| UsersSA[users.ts]
    
    SettingsSA --> SettingsDB[(GlobalSettings)]
    OlympiadSA --> OlympiadDB[(Olympiad/Task)]
    UsersSA --> UsersDB[(User)]
```

## 4. Сценарий: Изолированное Выполнение Кода (WebAssembly Sandbox)

Процесс безопасного выполнения Python-кода участника непосредственно в браузере.

```mermaid
sequenceDiagram
    participant UI as PythonShell / TaskUI
    participant Exec as code-executor.ts
    participant Worker as Web Worker (python-worker.js)
    participant Pyodide as Pyodide (WASM Engine)
    
    UI->>Exec: executeCode(sourceCode, stdin)
    Exec->>Worker: postMessage({ code, stdin, timeout })
    Worker->>Pyodide: Run code with stdin redirects
    alt Выполнение завершено вовремя
        Pyodide-->>Worker: Execution Output (stdout / errors)
        Worker-->>Exec: postMessage({ status: "success", output })
        Exec-->>UI: Display output and success state
    else Превышен таймаут (Watchdog)
        Worker->>Worker: Terminate Pyodide execution
        Worker-->>Exec: postMessage({ status: "timeout" })
        Exec-->>UI: Display Timeout error ("Превышен лимит времени")
    end
```

## 5. Сценарий: Ручная проверка решений и Отладка Администратором

Сценарий детальной оценки решений студентов.

```mermaid
sequenceDiagram
    participant Admin as ManualGrading UI
    participant Runner as StudentCodeRunner
    participant Exec as code-executor.ts
    participant SA as grading.ts (Server Action)
    participant DB as PostgreSQL
    
    Admin->>Runner: Click "Запустить решение"
    Runner->>Exec: Run student code on test inputs
    Exec-->>Runner: Return stdout comparison
    Runner-->>Admin: Render execution results
    
    Admin->>SA: updateGrade(resultId, taskId, score, feedback)
    SA->>DB: Save updated Score and Feedback
    SA->>SA: Recalculate total score and position in ranking
    SA->>DB: Update Result totalScore and ranking
    SA-->>Admin: Return success (triggers revalidatePath)
```

## 6. Схема Потока Данных (Data Flow)

1. **Input**: Пользователь взаимодействует с UI (React/Client Components).
2. **Trigger**: Вызывается Server Action с типизированными аргументами или локальная утилита выполнения (Pyodide).
3. **Validation**: Server Action проверяет сессию и данные через схему Zod.
4. **Backend**: Prisma выполняет транзакционные запросы к БД.
5. **Update**: Next.js автоматически вызывает `revalidatePath`, что мгновенно обновляет данные в интерфейсе для всех пользователей (без перезагрузки страницы).
