"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PythonShell } from "@/components/tasks/PythonShell"
import Editor from 'react-simple-code-editor'

import prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism-tomorrow.css'

const PreviewCodeTask = ({ question }: { question: any }) => {
  const [code, setCode] = useState<string>(
    question.referenceSolution || 
    "# Напишите решение здесь\n\ndef solve():\n    pass\n"
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-zinc-800 overflow-hidden bg-[#1e1e1e] min-h-[250px] relative shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Editor • Python</span>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden relative">
          <div className="bg-zinc-900/50 border-r border-white/5 py-4 px-2 text-right select-none min-w-[45px] font-mono text-xs">
            {code.split("\n").map((_, i) => (
              <div key={i} className="text-zinc-600 leading-[1.5rem] h-[1.5rem]">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1">
            <Editor
              value={code}
              onValueChange={(newCode) => setCode(newCode)}
              highlight={c => prism.highlight(c, prism.languages.python, 'python')}
              padding={16}
              className="font-mono text-sm leading-[1.5rem] text-zinc-100"
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                minHeight: '250px',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <PythonShell 
          code={code} 
          libraries={question.libraries || []} 
          theme={{ 
            bg: "bg-primary/5", 
            text: "text-primary", 
            border: "border-primary",
            accent: "primary",
            btn: "bg-primary hover:bg-primary/90 shadow-primary/20 shadow-lg"
          }}
        />
      </div>
    </div>
  );
};

export default function PreviewOlympiad({ olympiad, questions }: { olympiad: any; questions: any[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/olympiads/${olympiad.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Предосмотр</h1>
          <p className="text-muted-foreground italic">Так олимпиаду увидят участники</p>
        </div>
      </div>

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="px-3 py-1 text-sm font-bold bg-primary/10 text-primary border-primary/20">
            ОЛИМПИАДА
          </Badge>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {questions.length} ЗАДАНИЙ • {questions.reduce((acc, q) => acc + q.points, 0)} БАЛЛОВ
          </div>
        </div>
        <h2 className="text-4xl font-bold tracking-tight">{olympiad.title}</h2>
        <p className="text-xl text-muted-foreground leading-relaxed">{olympiad.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
           <div className="p-4 rounded-2xl bg-muted/50 border space-y-1">
             <p className="text-[10px] font-bold uppercase text-muted-foreground">Начало</p>
             <p className="font-bold">{mounted ? new Date(olympiad.startDate).toLocaleString("ru-RU") : "Загрузка..."}</p>
           </div>
           <div className="p-4 rounded-2xl bg-muted/50 border space-y-1">
             <p className="text-[10px] font-bold uppercase text-muted-foreground">Конец</p>
             <p className="font-bold">{mounted ? new Date(olympiad.endDate).toLocaleString("ru-RU") : "Загрузка..."}</p>
           </div>
        </div>
      </header>

      <Separator className="bg-primary/5 h-1 rounded-full" />

      <div className="space-y-12">
        {questions.map((q, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/10">
                {idx + 1}
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">{q.title}</h3>
                  <Badge variant="secondary" className="font-bold">{q.points} БАЛЛОВ</Badge>
                </div>
                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                  {q.content}
                </div>

                {q.type === "MULTIPLE_CHOICE" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    {q.options?.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center gap-3 p-4 rounded-xl border-2 border-muted bg-muted/20">
                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                        <span className="font-medium">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "CODE" && (
                  <PreviewCodeTask question={q} />
                )}

                {q.type === "TEXT" && (
                  <div className="h-40 rounded-2xl border-2 border-dashed border-muted bg-muted/10 flex items-center justify-center text-muted-foreground italic">
                    Текстовое поле для ответа
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-20 border-t flex justify-center">
            <Button size="lg" className="rounded-2xl px-12 h-14 text-lg font-bold shadow-xl shadow-primary/10" disabled>
                ЗАВЕРШИТЬ (ПРЕДОСМОТР)
            </Button>
      </div>
    </div>
  )
}
