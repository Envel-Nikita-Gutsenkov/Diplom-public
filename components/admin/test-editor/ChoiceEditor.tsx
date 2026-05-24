"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Question } from "./types";

interface ChoiceEditorProps {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
}

export const ChoiceEditor = ({ question, updateQuestion }: ChoiceEditorProps) => {
  return (
    <div className="space-y-4 pt-4 border-t border-primary/5">
      <Label className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60 flex items-center gap-2">
        <div className="w-4 h-[1px] bg-muted-foreground/20" /> Варианты ответов
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option, optIndex) => {
          const isCorrect = Array.isArray(question.correctOptions) && question.correctOptions.includes(optIndex);
          
          return (
            <motion.div 
              key={optIndex} 
              className={`flex gap-3 items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${isCorrect ? "border-green-500/50 bg-green-500/5 shadow-sm" : "border-muted/50 hover:border-primary/20 bg-muted/5"}`}
              onClick={() => {
                const currentArr = Array.isArray(question.correctOptions) ? question.correctOptions : [];
                let newCorrects;
                
                if (question.type === "MULTIPLE_CHOICE") {
                  newCorrects = currentArr.includes(optIndex) ? [] : [optIndex];
                } else {
                  newCorrects = currentArr.includes(optIndex) 
                    ? currentArr.filter(i => i !== optIndex) 
                    : [...currentArr, optIndex];
                }
                updateQuestion(question.id, { correctOptions: newCorrects });
              }}
            >
              <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${isCorrect ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30"}`}>
                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{String.fromCharCode(65 + optIndex)}</span>}
              </div>
              <Input 
                placeholder={`Вариант ${optIndex + 1}`} 
                className="border-none bg-transparent p-0 focus-visible:ring-0 h-auto font-medium"
                value={option}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[optIndex] = e.target.value;
                  updateQuestion(question.id, { options: newOptions });
                }}
              />
              <Button type="button" variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive transition-colors ml-auto" onClick={(e) => {
                e.stopPropagation();
                const newOptions = [...(question.options || [])];
                newOptions.splice(optIndex, 1);

                const currentArr = Array.isArray(question.correctOptions) ? question.correctOptions : [];
                const newCorrects = currentArr
                  .filter(i => i !== optIndex)
                  .map(i => i > optIndex ? i - 1 : i);
                updateQuestion(question.id, { options: newOptions, correctOptions: newCorrects });
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
        <Button 
          type="button" 
          variant="ghost" 
          className="h-full min-h-[52px] border-2 border-dashed border-muted/50 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all" 
          onClick={() => updateQuestion(question.id, { options: [...(question.options || []), ""] })}
        >
          <Plus className="w-4 h-4 mr-2" /> Добавить вариант
        </Button>
      </div>
    </div>
  );
};
