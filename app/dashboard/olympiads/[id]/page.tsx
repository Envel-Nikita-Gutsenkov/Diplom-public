export const dynamic = 'force-dynamic';
import { getOlympiadById } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, GraduationCap, PlayCircle, ArrowLeft, Info, Trophy } from "lucide-react"

export default async function OlympiadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const olympiad = await getOlympiadById(id)

  if (!olympiad) {
    notFound()
  }

  const themeMap: Record<string, { bg: string, text: string, border: string, accent: string, btn: string, shadow: string, gradient: string }> = {
    indigo: { 
      bg: "bg-indigo-50/30", text: "text-indigo-600", border: "border-indigo-100", accent: "bg-indigo-100/50", 
      btn: "from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600", shadow: "shadow-indigo-200",
      gradient: "from-indigo-500 via-blue-500 to-indigo-600"
    },
    amber: { 
      bg: "bg-amber-50/30", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-100/50", 
      btn: "from-amber-500 via-orange-600 to-amber-700 hover:from-amber-400 hover:to-amber-600", shadow: "shadow-amber-200",
      gradient: "from-amber-500 via-orange-500 to-amber-600"
    },
    emerald: { 
      bg: "bg-emerald-50/30", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-100/50", 
      btn: "from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600", shadow: "shadow-emerald-200",
      gradient: "from-emerald-500 via-teal-500 to-emerald-600"
    },
    rose: { 
      bg: "bg-rose-50/30", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-100/50", 
      btn: "from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600", shadow: "shadow-rose-200",
      gradient: "from-rose-500 via-pink-500 to-rose-600"
    },
    violet: { 
      bg: "bg-violet-50/30", text: "text-violet-700", border: "border-violet-100", accent: "bg-violet-100/50", 
      btn: "from-violet-600 via-purple-600 to-violet-700 hover:from-violet-500 hover:to-violet-600", shadow: "shadow-violet-200",
      gradient: "from-violet-500 via-purple-500 to-violet-600"
    },
    cyan: { 
      bg: "bg-cyan-50/30", text: "text-cyan-700", border: "border-cyan-100", accent: "bg-cyan-100/50", 
      btn: "from-cyan-600 via-sky-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600", shadow: "shadow-cyan-200",
      gradient: "from-cyan-500 via-sky-500 to-cyan-600"
    },
  }

  const theme = themeMap[(olympiad as any).colorTheme || "indigo"] || themeMap.indigo
  const emoji = (olympiad as any).emoji || "🎓"

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground group rounded-xl transition-all">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Назад к олимпиадам
            </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-5">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.bg} ${theme.text} text-xs font-bold tracking-[0.2em] uppercase border ${theme.border}/50 shadow-sm`}>
              <div className="text-lg">{emoji}</div>
              Олимпиада
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground">{olympiad.title}</h1>
          </div>

          <Card className={`border-none shadow-xl ${theme.shadow} rounded-[2.5rem] bg-card/60 backdrop-blur-md overflow-hidden relative`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${theme.text}/5 rounded-full blur-[80px] -mr-32 -mt-32`}></div>
            <CardHeader className={`bg-muted/30 border-b ${theme.border}/10 px-8 pt-8 pb-6`}>
                <CardTitle className={`text-xl font-bold flex items-center gap-3 ${theme.text}`}>
                  <div className={`p-2.5 rounded-xl ${theme.bg} shadow-inner`}>
                    <Info className="w-5 h-5" />
                  </div>
                  Описание и правила
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {olympiad.description}
                </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1">
          <Card className={`border-none shadow-2xl ${theme.shadow} rounded-[2.5rem] bg-gradient-to-b from-card/80 to-muted/30 backdrop-blur-md overflow-hidden sticky top-8`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${theme.gradient}`}></div>
            
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-background/50 border border-primary/5 shadow-sm">
                    <div className={`w-12 h-12 rounded-2xl ${theme.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                      <GraduationCap className={`h-6 w-6 ${theme.text}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 pt-1">Начало</h3>
                      <p className="font-bold text-foreground text-[15px]">{new Date(olympiad.startDate).toLocaleString("ru-RU", { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-background/50 border border-primary/5 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 shadow-inner">
                      <CalendarClock className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 pt-1">Окончание</h3>
                      <p className="font-bold text-foreground text-[15px]">{new Date(olympiad.endDate).toLocaleString("ru-RU", { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>

                  {olympiad.duration && (
                    <div className="flex items-start gap-4 p-5 rounded-3xl bg-background/50 border border-primary/5 shadow-sm">
                      <div className={`w-12 h-12 rounded-2xl ${theme.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                        <CalendarClock className={`h-6 w-6 ${theme.text} rotate-90`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 pt-1">Лимит времени</h3>
                        <p className="font-bold text-foreground text-[15px]">{olympiad.duration} минут</p>
                      </div>
                    </div>
                  )}
              </div>

              <div className="pt-6 border-t border-primary/10">
                <Button asChild className={`w-full h-16 rounded-[1.25rem] font-bold text-lg gap-3 bg-gradient-to-r ${theme.btn} text-white border-none shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]`}>
                  <Link href={`/dashboard/olympiads/${olympiad.id}/take`}>
                    <PlayCircle className="w-6 h-6" />
                    Начать олимпиаду
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-5 font-semibold leading-relaxed">
                  Убедитесь, что у вас есть достаточно времени перед началом тестирования.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
