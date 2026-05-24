"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, XCircle, Loader2, Plus, Trash2, CheckCircle2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question, TestCase } from "./types";
import { toast } from "sonner";
import Editor from "react-simple-code-editor";

import prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

interface CodeEditorProps {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
}

export const CodeEditor = ({ question, updateQuestion }: CodeEditorProps) => {
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<{ success: boolean; name: string; error?: string }[] | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker("/workers/python-worker.js");
    worker.onmessage = (e) => {
      if (e.data.type === "READY") {
        setWorkerReady(true);
        console.log("[ADMIN_EDITOR] Python Worker Ready");
      }
    };
    worker.postMessage({ type: "INIT" });
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const verifyTests = async () => {
    if (!question.referenceSolution || !question.testCases?.length) {
      toast.error("Добавьте эталонное решение и хотя бы один тест");
      return;
    }

    if (!workerReady || !workerRef.current) {
      toast.error("Python еще загружается, подождите немного...");
      return;
    }

    setVerifying(true);
    const testResults: { success: boolean; name: string; error?: string }[] = [];

    try {
      const runSingleTest = (testCase: TestCase) => {
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
          const combinedCode = `${mockInput}\n${question.referenceSolution}\n\n# --- TEST: ${testCase.name} ---\n${testCase.script}`;
          workerRef.current.postMessage({ type: "RUN", code: combinedCode, libraries: question.libraries });
        });
      };

      for (const test of (question.testCases || [])) {
        const res: any = await runSingleTest(test);
        testResults.push({ name: test.name, ...res });
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

  return (
    <div className="space-y-4 pt-4 border-t border-primary/5">
      <Label className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 flex items-center gap-2">
        <div className="w-4 h-[1px] bg-muted-foreground/20" /> Настройка окружения Python
      </Label>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold mb-2 block">Необходимые библиотеки:</Label>
          <div className="flex flex-wrap gap-2">
            {["numpy", "pandas", "matplotlib", "scipy", "scikit-learn", "networkx", "sympy", "beautifulsoup4"].map((lib) => {
              const isSelected = question.libraries?.includes(lib);
              return (
                <button
                  key={lib}
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2",
                    isSelected 
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                      : "bg-muted/30 text-muted-foreground border-transparent hover:border-primary/20"
                  )}
                  onClick={() => {
                    const current = question.libraries || [];
                    const next = isSelected 
                      ? current.filter(l => l !== lib)
                      : [...current, lib];
                    updateQuestion(question.id, { libraries: next });
                  }}
                >
                  {lib}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold flex items-center gap-2">
               Автопроверка решения (Python):
               <Badge variant={question.autoCheck ? "default" : "outline"} className="text-[9px] font-black uppercase">
                 {question.autoCheck ? "Включена" : "Выключена"}
               </Badge>
            </Label>
            <Button 
              type="button" 
              variant={question.autoCheck ? "default" : "outline"} 
              size="sm" 
              className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider"
              onClick={() => updateQuestion(question.id, { autoCheck: !question.autoCheck })}
            >
              {question.autoCheck ? "Отключить" : "Включить"}
            </Button>
          </div>

          {question.autoCheck && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-4">
                {(question.testCases || []).map((testCase, tIdx) => (
                  <div key={testCase.id} className="p-4 rounded-2xl bg-[#1e1e1e] border border-white/10 overflow-hidden group space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {tIdx + 1}
                        </div>
                        <Input 
                          className="h-7 bg-transparent border-none focus-visible:ring-0 text-xs font-bold text-zinc-300 p-0"
                          placeholder="Название теста"
                          value={testCase.name}
                          onChange={(e) => {
                            const next = [...(question.testCases || [])];
                            next[tIdx].name = e.target.value;
                            updateQuestion(question.id, { testCases: next });
                          }}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-zinc-500 hover:text-rose-500"
                        onClick={() => {
                          const next = (question.testCases || []).filter(t => t.id !== testCase.id);
                          updateQuestion(question.id, { testCases: next });
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="min-h-[120px] rounded-xl bg-black/40 border border-white/5 overflow-hidden font-mono text-[11px] leading-relaxed text-zinc-300">
                      <Editor
                        value={testCase.script}
                        onValueChange={(code) => {
                          const next = [...(question.testCases || [])];
                          next[tIdx].script = code;
                          updateQuestion(question.id, { testCases: next });
                        }}
                        highlight={(code) => prism.highlight(code, prism.languages.python, "python")}
                        padding={16}
                        className="editor-area"
                        style={{
                          fontFamily: '"Fira Code", "Fira Mono", monospace',
                          minHeight: '120px',
                          color: '#e4e4e7', // text-zinc-300
                        }}
                      />
                    </div>
                  </div>
                ))}

                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-dashed border-2 rounded-xl py-4 hover:bg-primary/5 hover:border-primary/20 transition-all group text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => {
                    const next = [...(question.testCases || []), { id: Math.random().toString(36).substr(2, 9), name: '', script: '' }];
                    updateQuestion(question.id, { testCases: next });
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-2" /> Добавить автотест
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-xs font-semibold flex items-center gap-2 text-primary/80">
                  <Play className="w-3 h-3" /> Эталонное решение (для проверки тестов):
                </Label>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative min-h-[150px] rounded-2xl bg-[#0d0d0d] border border-white/10 overflow-hidden font-mono text-xs leading-relaxed text-emerald-400">
                    <Editor
                      value={question.referenceSolution || ""}
                      onValueChange={(code) => updateQuestion(question.id, { referenceSolution: code })}
                      highlight={(code) => prism.highlight(code, prism.languages.python, "python")}
                      padding={20}
                      placeholder="# Напишите здесь правильный код решения"
                      className="editor-area"
                      style={{
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        minHeight: '150px',
                        color: '#34d399', // text-emerald-400
                      }}
                    />
                    
                    {!workerReady && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 animate-in fade-in duration-500">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Загрузка Pyodide...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={verifying}
                  onClick={verifyTests}
                  className="w-full h-10 gap-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Проверка...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Проверить мои тесты на эталоне
                    </>
                  )}
                </Button>
                
                {results && (
                  <div className="space-y-2 mt-4 animate-in fade-in duration-300">
                    {results.map((res, rIdx) => (
                      <div key={rIdx} className={cn(
                        "flex items-center justify-between p-3 rounded-xl border text-[11px] font-medium",
                        res.success ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-rose-500/5 border-rose-500/20 text-rose-500"
                      )}>
                        <div className="flex items-center gap-2">
                          {res.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{res.name || `Тест #${rIdx + 1}`}</span>
                        </div>
                        {!res.success && <span className="opacity-70 truncate max-w-[200px]">{res.error}</span>}
                        {res.success && <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">OK</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-[10px] text-muted-foreground italic px-2 flex items-center gap-2">
                 <AlertCircle className="w-3 h-3" />
                 Каждый тест выполняется отдельно. Код ученика доступен глобально.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
