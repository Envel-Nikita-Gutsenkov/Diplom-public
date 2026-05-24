import { spawn, execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

interface TestCase {
  name: string;
  script: string;
}

interface ExecutionResult {
  success: boolean;
  score: number | null; 
  details: string;
}

let cachedPythonCmd: string | null = null;

function getPythonCommand(): string {
  if (cachedPythonCmd) return cachedPythonCmd;
  try {
    execSync("python3 --version", { stdio: "ignore" });
    cachedPythonCmd = "python3";
    return "python3";
  } catch (e) {
    try {
      execSync("python --version", { stdio: "ignore" });
      cachedPythonCmd = "python";
      return "python";
    } catch (e2) {
      cachedPythonCmd = "python3";
      return "python3";
    }
  }
}

const runPythonAsync = (filePath: string, timeoutMs: number): Promise<{status: number | null, stdout: string, stderr: string, error?: any}> => {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let isFinished = false;

    const child = spawn(getPythonCommand(), [filePath], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    
    const timer = setTimeout(() => {
      if (!isFinished) {
        child.kill('SIGKILL');
        resolve({ status: null, stdout, stderr, error: { code: 'ETIMEDOUT', message: 'Timeout' } });
      }
    }, timeoutMs);

    child.stdout.on("data", (data) => {
        stdout += data.toString();
        if (stdout.length > 1024 * 512) child.kill(); 
    });
    
    child.stderr.on("data", (data) => {
        stderr += data.toString();
        if (stderr.length > 1024 * 512) child.kill();
    });
    
    child.on("error", (err) => {
       isFinished = true;
       clearTimeout(timer);
       resolve({ status: null, stdout, stderr, error: err });
    });
    
    child.on("close", (code) => {
       if (isFinished) return;
       isFinished = true;
       clearTimeout(timer);
       resolve({ status: code, stdout, stderr });
    });
  });
};

export async function executePythonCode(
  code: string,
  testCases: TestCase[],
  totalPoints: number
): Promise<ExecutionResult> {
  if (!testCases || testCases.length === 0) {
    return { success: true, score: totalPoints, details: "Нет автотестов. (Сдано)" };
  }

  try {
    let passedCount = 0;
    let details = "";
    let systemErrorOccurred = false;

    
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "olympiad-"));

    for (let i = 0; i < testCases.length; i++) {
      const test = testCases[i];
      const filePath = path.join(tempDir, `test_${i}.py`);
      const secretToken = crypto.randomUUID(); 

      const combinedCode = `import builtins
# --- СИСТЕМА БЕЗОПАСНОСТИ ---
try:
    import resource
    # Ограничение памяти в 32 МБ (защита от memory bomb)
    max_mem = 32 * 1024 * 1024
    resource.setrlimit(resource.RLIMIT_AS, (max_mem, max_mem))
except Exception:
    pass

original_import = builtins.__import__
def secure_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name in ['os', 'sys', 'subprocess', 'shutil', 'socket', 'pathlib', 'pty', 'resource']:
        raise ImportError("Импорт модуля '" + name + "' запрещен из соображений безопасности")
    return original_import(name, globals, locals, fromlist, level)
builtins.__import__ = secure_import

def mock_open(*args, **kwargs):
    raise PermissionError("Работа с файлами запрещена")
builtins.open = mock_open

def mock_eval(*args, **kwargs):
    raise PermissionError("eval() запрещен")
builtins.eval = mock_eval

def mock_exec(*args, **kwargs):
    raise PermissionError("exec() запрещен")
builtins.exec = mock_exec

def mock_input(prompt=''): return '0'
builtins.input = mock_input
# -----------------------------

${code}

# --- TEST: ${test.name} ---
${test.script}

# --- ANTI-FORGERY TOKEN ---
print("${secretToken}")
`;

      fs.writeFileSync(filePath, combinedCode);

      
      const result = await runPythonAsync(filePath, 5000);

      
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}

      if (result.error) {
        if (result.error.code === "ETIMEDOUT") {
          details += `Тест "${test.name}": Превышено время выполнения (Timeout 5s)\n`;
        } else {
          details += `Тест "${test.name}": Системная ошибка (${result.error.message})\n`;
          systemErrorOccurred = true;
        }
        continue;
      }

      
      if (result.status !== 0 || !result.stdout.includes(secretToken)) {
        details += `Тест "${test.name}": Ошибка выполнения\n${result.stderr || "Программа завершилась до окончания теста (возможно raise SystemExit)"}\n`;
        continue;
      }

      passedCount++;
      details += `Тест "${test.name}": Пройден успешно\n`;
    }

    try {
      fs.rmdirSync(tempDir);
    } catch (e) {}

    if (systemErrorOccurred) {
      return { success: false, score: null, details: `Системный сбой при автопроверке. Отправлено на ручную проверку.\n${details}` };
    }

    const score = Math.round((passedCount / testCases.length) * totalPoints);
    const success = passedCount === testCases.length;

    return {
      success,
      score,
      details: success ? "Все тесты пройдены!" : details,
    };
  } catch (error: any) {
    console.error("[CODE_EXECUTOR] Fatal error:", error);
    return { success: false, score: null, details: `Критическая ошибка сервера. Отправлено на ручную проверку: ${error.message}` };
  }
}
