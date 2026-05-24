"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, CheckCircle2, XCircle, Terminal, FlaskConical, LayoutPanelLeft, Maximize2, Minimize2 } from "lucide-react";
import Editor from "react-simple-code-editor";

import prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PythonShell } from "@/components/tasks/PythonShell";

interface StudentCodeRunnerProps {
  initialCode: string;
  testCases?: { name: string; script: string }[];
  libraries?: string[];
}

export const StudentCodeRunner = ({ initialCode, testCases, libraries = [] }: StudentCodeRunnerProps) => {
  const [code, setCode] = useState(initialCode || "");
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<{ success: boolean; name: string; error?: string }[] | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"autotests" | "terminal">("autotests");
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const worker = new Worker("/workers/python-worker.js");
    worker.onmessage = (e) => {
      if (e.data.type === "READY") {
        setWorkerReady(true);
      }
    };
    worker.postMessage({ type: "INIT" });
    workerRef.current = worker;

    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      worker.terminate();
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      toast.error("Полноэкранный режим не поддерживается вашим браузером");
    }
  };

  const verifyTests = async () => {
    if (!testCases?.length) {
      toast.error("У этого задания нет автотестов");
      return;
    }

    if (!workerReady || !workerRef.current) {
      toast.error("Python еще загружается, подождите немного...");
      return;
    }

    setVerifying(true);
    const testResults: { success: boolean; name: string; error?: string }[] = [];

    try {
      const runSingleTest = (testCase: { name: string; script: string }) => {
        return new Promise((resolve) => {
          if (!workerRef.current) return resolve({ success: false, error: "Worker lost" });

          const handler = (e: MessageEvent) => {
            if (e.data.type === "SUCCESS") {
              workerRef.current?.removeEventListener("message", handler);
              resolve({ success: true });
            }
            if (e.data.type === "ERROR") {
              workerRef.current?.removeEventListener("message", handler);
              resolve({ success: false, error: e.data.error });
            }
          };

          workerRef.current.addEventListener("message", handler);

          const mockInput = "import builtins\ndef mock_input(prompt=''): return '0'\nbuiltins.input = mock_input\n";
          const combinedCode = `${mockInput}\n${code}\n\n# --- TEST: ${testCase.name} ---\n${testCase.script}`;
          workerRef.current.postMessage({ type: "RUN", code: combinedCode, libraries });
        });
      };

      for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const res: any = await runSingleTest(test);
        testResults.push({ name: test.name || `Тест ${i + 1}`, ...res });
      }

      setResults(testResults);

      if (testResults.every(r => r.success)) {
        toast.success("Все тесты пройдены успешно!");
      } else {
        toast.error("Некоторые тесты не прошли");
      }
    } catch (err: any) {
      toast.error("Ошибка при выполнении тестов: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const hasTests = testCases && testCases.length > 0;

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef}
        className={cn(
          "relative overflow-hidden bg-[#1e1e1e] flex flex-col", 
          isFullScreen ? "w-screen h-screen rounded-none" : "rounded-2xl border border-slate-200 shadow-xl"
        )}
      >
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/5 gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-fit">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Редактор кода</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setActiveTab("terminal")}
              variant={activeTab === "terminal" ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-2 rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === "terminal" ? "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent" : "bg-transparent text-zinc-400 border-white/10 hover:bg-white/5 hover:text-zinc-300"
              )}
            >
              <LayoutPanelLeft className="w-3 h-3" />
              Терминал
            </Button>
            {hasTests && (
              <Button
                onClick={() => setActiveTab("autotests")}
                variant={activeTab === "autotests" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-2 rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === "autotests" ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent" : "bg-transparent text-zinc-400 border-white/10 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                <FlaskConical className="w-3 h-3" />
                Автотесты
              </Button>
            )}
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />
            <Button
              onClick={toggleFullScreen}
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl h-8 bg-transparent text-zinc-400 border-white/10 hover:bg-white/5 hover:text-zinc-300"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className={cn("overflow-auto custom-scrollbar relative border-b border-white/5", isFullScreen ? "flex-1 max-h-none" : "max-h-[500px]")}>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(c) => prism.highlight(c, prism.languages.python, "python")}
            padding={24}
            className="font-mono text-sm"
            textareaClassName="focus:outline-none"
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              color: "#d4d4d4",
              minHeight: isFullScreen ? "100%" : "350px"
            }}
          />
        </div>

        <div className={cn("bg-[#1a1a1a] p-0 relative shrink-0", isFullScreen && activeTab === "terminal" && "h-[40vh] overflow-hidden flex flex-col")}>
          {activeTab === "autotests" && hasTests && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Результаты автотестов</h4>
                <Button
                  onClick={verifyTests}
                  disabled={verifying || !workerReady}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest"
                >
                  {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  {verifying ? "Проверка..." : "Запустить тесты"}
                </Button>
              </div>
              
              {results ? (
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "p-4 rounded-xl border flex items-start gap-3",
                        r.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                      )}
                    >
                      {r.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className={cn("font-bold text-sm", r.success ? "text-emerald-400" : "text-rose-400")}>
                          {r.name}
                        </p>
                        {r.error && (
                          <p className="text-xs font-mono text-rose-300 mt-2 bg-rose-500/20 p-2 rounded-lg whitespace-pre-wrap break-all">
                            {r.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 font-medium text-sm flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                  Нажмите "Запустить тесты" для проверки кода
                </div>
              )}
            </div>
          )}

          {activeTab === "terminal" && (
            <div className="border-t border-white/5">
              <PythonShell 
                code={code} 
                libraries={libraries} 
                theme={{ bg: "bg-[#1a1a1a]", text: "text-emerald-400", border: "border-transparent", btn: "bg-indigo-600" }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
