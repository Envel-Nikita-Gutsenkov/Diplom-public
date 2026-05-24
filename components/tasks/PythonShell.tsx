"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Trash2, Maximize2, Minimize2, Loader2, Terminal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PythonShellProps {
  code: string;
  libraries?: string[];
  theme: any;
}

export const PythonShell = ({ code, libraries = [], theme }: PythonShellProps) => {
  const [output, setOutput] = useState<{ type: "stdout" | "stderr" | "status" | "error"; content: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const outputBufferRef = useRef<{ type: any; content: string }[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [realtimeInput, setRealtimeInput] = useState("");
  const stdinBufferRef = useRef<SharedArrayBuffer | null>(null);

  useEffect(() => {

    if (typeof SharedArrayBuffer !== "undefined") {
      stdinBufferRef.current = new SharedArrayBuffer(1024); 
    }
    
    initWorker();
    return () => {
      terminateWorker();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const initWorker = () => {
    setIsInitializing(true);
    const worker = new Worker("/workers/python-worker.js");

    worker.onmessage = (e) => {
      const { type, content, error, status, executionTime: time } = e.data;

      switch (type) {
        case "READY":
          setIsInitializing(false);
          break;
        case "STDOUT":
        case "STDERR":
        case "STATUS":
          const lineType = type.toLowerCase() as any;
          outputBufferRef.current.push({ type: lineType, content });


          if (outputBufferRef.current.length > 1000) {
            outputBufferRef.current = outputBufferRef.current.slice(-1000);
          }


          const now = Date.now();
          if (now - lastUpdateRef.current > 100) {
            setOutput([...outputBufferRef.current]);
            lastUpdateRef.current = now;
          }
          break;
        case "SUCCESS":
          finalizeExecution(time);
          break;
        case "INPUT_PROMPT":
          setInputPrompt(e.data.prompt);
          break;
        case "INPUT_REQUEST":
          setIsWaitingForInput(true);
          setActiveTab("output");
          break;
        case "ERROR":
          outputBufferRef.current.push({ type: "error", content: error });
          finalizeExecution();
          break;
      }
    };

    worker.postMessage({ type: "INIT" });
    workerRef.current = worker;
  };

  const finalizeExecution = (time: string | null = null) => {
    setIsRunning(false);
    setIsWaitingForInput(false);
    setInputPrompt("");
    if (time) setExecutionTime(time);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setOutput([...outputBufferRef.current]);
  };

  const terminateWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const runCode = () => {
    if (isRunning || isInitializing) return;

    setExecutionTime(null);
    setIsRunning(true);
    setInputPrompt("");
    setOutput([]);
    setActiveTab("output");
    outputBufferRef.current = [];
    lastUpdateRef.current = Date.now();


    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        setOutput(prev => [...prev, { type: "error", content: "Execution Timeout: Лимит времени (30с) превышен." }]);
        stopCode();
      }
    }, 30000);

    if (workerRef.current) {
      workerRef.current.postMessage({ 
        type: "RUN", 
        code, 
        libraries, 
        inputData: userInput,
        stdinBuffer: stdinBufferRef.current
      });
    } else {
      initWorker();
      setTimeout(() => {
        workerRef.current?.postMessage({ 
          type: "RUN", 
          code, 
          libraries, 
          inputData: userInput,
          stdinBuffer: stdinBufferRef.current
        });
      }, 500);
    }
  };

  const stopCode = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    terminateWorker();
    setIsRunning(false);
    setOutput(prev => [...prev, { type: "error", content: "Выполнение прервано пользователем." }]);
    initWorker();
  };

  const clearConsole = () => {
    setOutput([]);
    setExecutionTime(null);
  };

  const sendInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!stdinBufferRef.current || !isRunning) return;

    const int32Buffer = new Int32Array(stdinBufferRef.current);
    const uint8Buffer = new Uint8Array(stdinBufferRef.current, 8);
    
    const encoded = new TextEncoder().encode(realtimeInput);
    const length = Math.min(encoded.length, uint8Buffer.length);
    
    uint8Buffer.set(encoded.slice(0, length));
    Atomics.store(int32Buffer, 1, length);
    Atomics.store(int32Buffer, 0, 1);
    Atomics.notify(int32Buffer, 0);
    

    outputBufferRef.current.push({ type: "stdout", content: realtimeInput + "\n" });
    setOutput([...outputBufferRef.current]);
    
    setRealtimeInput("");
    setIsWaitingForInput(false);
  };

  return (
    <div className={cn(
      "flex flex-col border-2 rounded-2xl overflow-hidden transition-all duration-300 bg-[#1e1e1e] shadow-2xl",
      isFullScreen ? "fixed inset-0 z-[100] rounded-none" : "min-h-[400px]"
    )}>
      {}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-4 mr-1">
            <button 
              onClick={() => setActiveTab("output")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                activeTab === "output" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <Terminal className="w-3.5 h-3.5" /> Консоль
            </button>
            <button 
              onClick={() => setActiveTab("input")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                activeTab === "input" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" /> Ввод (stdin)
            </button>
          </div>

          {executionTime && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-zinc-400">
              <Clock className={cn("w-3 h-3 opacity-60", theme?.text || "text-primary")} />
              {executionTime} ms
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConsole}
            className="h-8 px-2 text-zinc-400 hover:text-white hover:bg-white/5 gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold hidden sm:inline">Очистить</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {isRunning ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={stopCode}
              className="h-8 px-4 gap-2 font-bold text-[10px] uppercase"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Остановить
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={runCode}
              disabled={isInitializing}
              className={cn("h-8 px-6 gap-2 font-bold text-[10px] uppercase shadow-md shadow-primary/10", theme?.btn || "bg-primary")}
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Загрузка...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Запустить
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
        {activeTab === "output" ? (
          <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar">
            {output.length === 0 && !isRunning && (
              <div className="text-zinc-600 italic">Нажмите "Запустить", чтобы выполнить код...</div>
            )}

            {output.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "mb-1 break-words whitespace-pre-wrap animate-in fade-in slide-in-from-left-1 duration-200",
                  line.type === "stderr" || line.type === "error" ? "text-rose-400" :
                    line.type === "status" ? cn("italic opacity-60", theme?.text || "text-primary") : "text-zinc-100"
                )}
              >
                {line.type === "error" && "Error: "}{line.content}
              </div>
            ))}

            {isRunning && (
              <div className={cn("flex items-center gap-2 mt-2 opacity-60", theme?.text || "text-primary")}>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  {isWaitingForInput ? "Ожидание ввода..." : "Выполнение..."}
                </span>
              </div>
            )}
            
            {isRunning && (
              <form 
                onSubmit={sendInput}
                className="mt-4 flex gap-2 animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="relative flex-1 group flex items-center">
                  <div className={cn(
                    "absolute -inset-0.5 rounded-xl blur opacity-30 transition duration-500 group-hover:opacity-100",
                    isWaitingForInput ? "bg-amber-500" : "bg-primary"
                  )}></div>
                  <div className={cn(
                    "relative w-full flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden transition-all",
                    isWaitingForInput && "border-amber-500/50 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]"
                  )}>
                    {inputPrompt && (
                      <span className="pl-4 pr-2 py-2 text-amber-500 font-bold font-mono text-sm border-r border-white/10 bg-white/5 whitespace-nowrap">
                        {inputPrompt}
                      </span>
                    )}
                    <input
                      type="text"
                      value={realtimeInput}
                      onChange={(e) => setRealtimeInput(e.target.value)}
                      placeholder={isWaitingForInput && !inputPrompt ? "Введите данные для программы..." : isWaitingForInput ? "Ввод..." : "Введите input..."}
                      autoFocus={isWaitingForInput}
                      className="flex-1 bg-transparent px-4 py-2 text-sm text-white focus:outline-none w-full"
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all",
                    isWaitingForInput && "border-amber-500/30 text-amber-500 hover:text-amber-400"
                  )}
                >
                  Отправить
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Входные данные (stdin)</span>
                <span className="text-[9px] text-zinc-600 uppercase font-bold">Одна строка — один вызов input()</span>
              </div>
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Введите данные здесь..."
              className="flex-1 bg-white/5 border-2 border-white/5 rounded-2xl p-4 font-mono text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-primary/20 transition-all resize-none custom-scrollbar"
            />
          </div>
        )}
      </div>

      {/* Footer / Libraries List */}
      <div className="px-6 py-2 bg-[#252526] border-t border-white/5 min-h-[32px] flex items-center">
        {libraries.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 mr-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" /> Библиотеки:
            </span>
            {libraries.map((lib, i) => (
              <span key={i} className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all duration-300",
                "bg-white/10 text-white border-white/20 hover:border-white/40 hover:bg-white/20 shadow-sm shadow-black/20"
              )}>
                {lib}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 italic">
            Стандартная библиотека
          </div>
        )}
      </div>
    </div>
  );
};
