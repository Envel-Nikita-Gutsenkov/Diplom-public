"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { Question } from "./types";
import { ChoiceEditor } from "./ChoiceEditor";
import { CodeEditor } from "./CodeEditor";

interface QuestionCardProps {
  question: Question;
  index: number;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
}

export const QuestionCard = ({ question, index, updateQuestion, removeQuestion }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      layout
      className="relative"
    >
      <Card className="relative group overflow-hidden border-2 border-primary/5 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-primary/40" />
        
        <CardHeader className="py-4 flex flex-row items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
            {index + 1}
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold tracking-widest uppercase text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                 {question.type === "MULTIPLE_CHOICE" ? "Один ответ" : question.type === "CHECKBOX" ? "Несколько ответов" : question.type === "CODE" ? "Программирование" : "Свободный ответ"}
              </span>
            </div>
            <Input 
              className="mt-1 text-xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30" 
              placeholder="Название задачи..."
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
               <Label className="text-[10px] font-bold uppercase text-muted-foreground">Баллы</Label>
               <input 
                type="number" 
                className="w-12 bg-transparent text-sm font-bold border-none focus:outline-none focus:ring-0 text-center"
                value={question.points}
                onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
               />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(question.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-all">
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-2 pb-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 flex items-center gap-2">
              <div className="w-4 h-[1px] bg-muted-foreground/20" /> Описание задачи
            </Label>
            <Textarea 
              placeholder="Опишите условие задачи, ограничения и примеры..." 
              className="min-h-[120px] resize-none bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-base leading-relaxed"
              value={question.content}
              onChange={(e) => updateQuestion(question.id, { content: e.target.value })}
            />
          </div>

          {(question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX") && (
            <ChoiceEditor question={question} updateQuestion={updateQuestion} />
          )}

          {question.type === "CODE" && (
            <CodeEditor question={question} updateQuestion={updateQuestion} />
          )}

          {question.type === "TEXT" && (
             <div className="space-y-4 pt-4 border-t border-primary/5">
                <Label className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-muted-foreground/20" /> Правильный ответ (для автопроверки)
                </Label>
                <div className="space-y-3">
                    <Input 
                        placeholder="Введите вариант правильного ответа..." 
                        className="bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary/20 font-medium"
                        value={question.correctOptions?.[0] || ""}
                        onChange={(e) => updateQuestion(question.id, { correctOptions: [e.target.value as any] })}
                    />
                    <p className="text-[10px] text-muted-foreground italic px-2">
                        * Если оставить пустым, задание потребует ручной проверки.
                    </p>
                </div>
             </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
