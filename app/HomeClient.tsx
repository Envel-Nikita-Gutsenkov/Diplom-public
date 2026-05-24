"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { motion, useScroll } from "framer-motion";
import { InteractiveBackground } from "@/components/common/InteractiveBackground";
import { Code2, ShieldAlert, Cpu, Trophy, Terminal, Lock, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function HomeClient({ registrationEnabled }: { registrationEnabled: boolean }) {
  const dict = getDictionary("ru");
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: <Terminal className="w-6 h-6 text-primary" />,
      title: "Интерактивная среда",
      description: "Выполнение кода прямо в браузере без задержек благодаря технологии WebAssembly (Pyodide)."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-destructive" />,
      title: "Продвинутый анти-чит",
      description: "Блокировка подозрительных действий, отслеживание потери фокуса и детальный лог нарушений."
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-500" />,
      title: "Мгновенная проверка",
      description: "Автоматическое тестирование отправляемых решений с детальными отчетами об ошибках."
    },
    {
      icon: <Code2 className="w-6 h-6 text-blue-500" />,
      title: "Гибкие форматы задач",
      description: "Интеграция тестов, открытых вопросов и задач на программирование в одном интерфейсе."
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      title: "Прозрачная статистика",
      description: "Система баллов, списки лидеров и полная аналитика для преподавателей и студентов."
    },
    {
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: "Изолированная система",
      description: "Безопасное хранение данных и результатов в независимом Docker-окружении."
    }
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <InteractiveBackground />

      {}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/95 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
            Олимпиада
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-full font-medium">
              <Link href="/login">{dict.home.login}</Link>
            </Button>
            {registrationEnabled && (
              <Button asChild className="rounded-full shadow-none hover:scale-105 transition-transform font-bold">
                <Link href="/register">{dict.home.register}</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center w-full">
        {}
        <section className="min-h-screen w-full flex flex-col items-center justify-start pt-32 px-4">
          <motion.div
            className="max-w-5xl mx-auto text-center space-y-8 flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 text-sm font-bold mb-4 backdrop-blur-md cursor-default shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              ДИПЛОМНЫЙ ПРОЕКТ
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05]">
              Эволюция оценки <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 drop-shadow-sm">
                знаний.
              </span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
              Участвуйте в сложных олимпиадах, проверяйте свои знания и соревнуйтесь с другими участниками в режиме реального времени.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10 w-full sm:w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all group border-none">
                <Link href="/login">
                  Начать работу
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all hover:scale-105">
                <Link href="#features">Возможности</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-4 relative w-full border-t border-border/20 bg-muted/5">
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Всё для идеальной организации</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                Платформа берет на себя всю рутину, позволяя сосредоточиться на главном — на коде.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group relative p-8 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/40 hover:bg-card transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col items-start gap-5">
                    <div className="p-3.5 rounded-2xl bg-muted border border-border/50 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden border border-blue-500/20 bg-blue-500/[0.03] backdrop-blur-2xl shadow-2xl shadow-blue-500/5 focus-within:ring-2 ring-blue-500/20 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-cyan-500/[0.05]" />

            <div className="relative z-10 p-12 md:p-24 text-center space-y-8 flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-sm text-foreground">Идеальная олимпиада.</h2>
              <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl text-center text-muted-foreground">
                Только чистый код, честная борьба и мгновенный результат.
              </p>

              <div className="pt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {registrationEnabled && (
                  <Button asChild size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform shadow-lg shadow-blue-500/25 border-none">
                    <Link href="/register">Регистрация</Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold border-blue-500/20 hover:bg-blue-500/5 backdrop-blur-sm transition-all hover:scale-105 text-blue-600">
                  <Link href="/login">Вход в систему</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {}
      <footer className="relative z-10 border-t border-border/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-center">
          <p className="text-sm text-muted-foreground/60 font-medium tracking-tight">
            Разработал Гуценков Никита в 2026 году
          </p>
        </div>
      </footer>
    </div>
  );
}
