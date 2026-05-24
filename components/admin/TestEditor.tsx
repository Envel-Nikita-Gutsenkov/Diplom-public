"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as yaml from "yaml";
import { toast } from "sonner";
import { Question, QuestionType } from "./test-editor/types";
import { QuestionCard } from "./test-editor/QuestionCard";

export const TestEditor = ({ initialQuestions = [] }: { initialQuestions?: Question[] }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: "",
      content: "",
      points: 10,
      options: (type === "MULTIPLE_CHOICE" || type === "CHECKBOX") ? ["", "", "", ""] : undefined,
      correctOptions: (type === "MULTIPLE_CHOICE" || type === "CHECKBOX") ? [] : undefined,
      libraries: type === "CODE" ? [] : undefined,
      autoCheck: type === "CODE" ? false : undefined,
      testCases: type === "CODE" ? [] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const exportYaml = () => {
    const cleanQuestions = questions.map(q => ({
       title: q.title,
       type: q.type,
       points: q.points,
       content: q.content,
       options: (q.type === "MULTIPLE_CHOICE" || q.type === "CHECKBOX") ? q.options : undefined,
       correctOptions: (q.type === "MULTIPLE_CHOICE" || q.type === "CHECKBOX") ? (Array.isArray(q.correctOptions) ? q.correctOptions : []) : undefined,
       libraries: q.type === "CODE" ? q.libraries : undefined,
       autoCheck: q.type === "CODE" ? q.autoCheck : undefined,
       testCases: q.type === "CODE" ? q.testCases : undefined,
       referenceSolution: q.type === "CODE" ? q.referenceSolution : undefined
    }));
    const yamlStr = yaml.stringify(cleanQuestions, {
      defaultStringType: 'QUOTE_DOUBLE',
      defaultKeyType: 'PLAIN'
    });
    const blob = new Blob([yamlStr], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tasks-export.yml";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importYaml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        let parsed;
        try {
          parsed = yaml.parse(content);
        } catch (e: any) {
          throw new Error(`Ошибка синтаксиса YAML: ${e.message}`);
        }

        if (!Array.isArray(parsed)) {
          throw new Error("Файл должен содержать список (массив) задач.");
        }

        const imported = parsed.map((q, idx) => {
          if (!q.title || !q.content || !q.type) {
             throw new Error(`Задача #${idx + 1} пропущена или неполная.`);
          }
          
          return {
             id: Math.random().toString(36).substr(2, 9),
             title: String(q.title),
             type: (q.type as QuestionType),
             points: Number(q.points) || 10,
             content: String(q.content),
             options: Array.isArray(q.options) ? q.options.map(String) : [],
             correctOptions: Array.isArray(q.correctOptions) ? q.correctOptions.map(Number) : [],
             libraries: Array.isArray(q.libraries) ? q.libraries.map(String) : [],
             autoCheck: Boolean(q.autoCheck),
             testCases: Array.isArray(q.testCases) ? q.testCases : [],
             referenceSolution: q.referenceSolution ? String(q.referenceSolution) : ""
          };
        });

        setQuestions(imported);
        toast.success(`Успешно импортировано ${imported.length} задач(и)`);
      } catch (err: any) {
        toast.error(err.message || "Ошибка при чтении YAML файла.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAllQuestions = () => {
    if (questions.length === 0) return;
    if (confirm(`Вы уверены, что хотите удалить все вопросы (${questions.length})?`)) {
        setQuestions([]);
        toast.success("Все вопросы удалены");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
        <div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Конструктор задач
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Добавляйте вопросы различных типов для вашей олимпиады</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <input type="file" id="yaml-upload" accept=".yml,.yaml" className="hidden" onChange={importYaml} />
            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('yaml-upload')?.click()} className="h-8 gap-2 hover:bg-primary/10 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Импорт YAML
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportYaml} className="h-8 gap-2 hover:bg-primary/10 transition-colors" disabled={questions.length === 0}>
                <Download className="w-3.5 h-3.5" /> Экспорт
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearAllQuestions} className="h-8 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors" disabled={questions.length === 0}>
                <Trash2 className="w-3.5 h-3.5" /> Удалить всё
            </Button>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => addQuestion("MULTIPLE_CHOICE")} size="sm" variant="default" className="h-8 gap-1.5 rounded-full shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Один ответ
            </Button>
            <Button type="button" onClick={() => addQuestion("CHECKBOX")} size="sm" variant="default" className="h-8 gap-1.5 rounded-full shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Несколько
            </Button>
            <Button type="button" onClick={() => addQuestion("CODE")} size="sm" variant="default" className="h-8 gap-1.5 rounded-full shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Код
            </Button>
            <Button type="button" onClick={() => addQuestion("TEXT")} size="sm" variant="default" className="h-8 gap-1.5 rounded-full shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Текст
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {questions.map((q, index) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              index={index} 
              updateQuestion={updateQuestion} 
              removeQuestion={removeQuestion} 
            />
          ))}
        </AnimatePresence>

        {questions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-12 border-t border-primary/5 mt-6"
          >
            <div className="text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-1.5 rounded-full border">
                Добавить следующую задачу
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button type="button" onClick={() => addQuestion("MULTIPLE_CHOICE")} size="lg" variant="outline" className="h-12 px-8 gap-2 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Plus className="w-5 h-5 text-primary" /> Один ответ
              </Button>
              <Button type="button" onClick={() => addQuestion("CHECKBOX")} size="lg" variant="outline" className="h-12 px-8 gap-2 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Plus className="w-5 h-5 text-primary" /> Несколько
              </Button>
              <Button type="button" onClick={() => addQuestion("CODE")} size="lg" variant="outline" className="h-12 px-8 gap-2 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Plus className="w-5 h-5 text-primary" /> Программирование
              </Button>
              <Button type="button" onClick={() => addQuestion("TEXT")} size="lg" variant="outline" className="h-12 px-8 gap-2 rounded-2xl shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Plus className="w-5 h-5 text-primary" /> Свободный ответ
              </Button>
            </div>
          </motion.div>
        )}

        {questions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border-2 border-dashed border-primary/10 rounded-3xl text-muted-foreground bg-primary/5 space-y-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-primary/40" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">Задачи пока не добавлены</p>
              <p className="text-sm">Используйте кнопки выше, чтобы собрать вашу первую олимпиаду</p>
            </div>
          </motion.div>
        )}
      </div>

      <input type="hidden" name="questions" value={JSON.stringify(questions)} />
    </div>
  );
};
