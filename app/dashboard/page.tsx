export const dynamic = 'force-dynamic';
import Link from "next/link"
import { getActiveOlympiads } from "@/app/actions/olympiad"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, CalendarClock, ArrowRight, Sparkles } from "lucide-react"

export default async function Dashboard() {
  const session = await auth()
  const olympiads = await getActiveOlympiads()
  const userName = session?.user?.name || "Студент"

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-10">
      {}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-white p-8 md:p-12 border border-indigo-100/50 shadow-sm transition-all duration-500 hover:shadow-md group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100/20 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.07] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-indigo-900 -rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Личный кабинет</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-slate-900">
            Привет, <span className="text-indigo-600">{userName}</span>!
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl opacity-90">
            Здесь собраны все олимпиады, в которых ты можешь принять участие, и твои успехи.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-1.5 h-6 rounded-full bg-indigo-500/50"></div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Доступные испытания</h2>
        </div>

        {olympiads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-indigo-200/30 rounded-[2.5rem] bg-indigo-50/10">
            <div className="w-20 h-20 rounded-full bg-indigo-500/5 flex items-center justify-center mb-6">
                <GraduationCap className="h-10 w-10 text-indigo-500/30" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">На сегодня всё</h3>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm">Новые олимпиады скоро появятся в этом списке.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
            {olympiads.map((olympiad: any, idx: number) => {
              const themeMap: Record<string, { bg: string, text: string, border: string, accent: string, btn: string, shadow: string, glow: string }> = {
                indigo: { 
                  bg: "bg-indigo-50/30", text: "text-indigo-600", border: "border-indigo-100", accent: "bg-indigo-100/50", 
                  btn: "bg-indigo-600 hover:bg-indigo-700", shadow: "shadow-indigo-200", glow: "group-hover:bg-indigo-500/10" 
                },
                blue: { 
                  bg: "bg-blue-50/30", text: "text-blue-600", border: "border-blue-100", accent: "bg-blue-100/50", 
                  btn: "bg-blue-600 hover:bg-blue-700", shadow: "shadow-blue-200", glow: "group-hover:bg-blue-500/10" 
                },
                sky: { 
                  bg: "bg-sky-50/30", text: "text-sky-600", border: "border-sky-100", accent: "bg-sky-100/50", 
                  btn: "bg-sky-600 hover:bg-sky-700", shadow: "shadow-sky-200", glow: "group-hover:bg-sky-500/10" 
                },
                cyan: { 
                  bg: "bg-cyan-50/30", text: "text-cyan-700", border: "border-cyan-100", accent: "bg-cyan-100/50", 
                  btn: "bg-cyan-600 hover:bg-cyan-700", shadow: "shadow-cyan-200", glow: "group-hover:bg-cyan-500/10" 
                },
                teal: { 
                  bg: "bg-teal-50/30", text: "text-teal-700", border: "border-teal-100", accent: "bg-teal-100/50", 
                  btn: "bg-teal-600 hover:bg-teal-700", shadow: "shadow-teal-200", glow: "group-hover:bg-teal-500/10" 
                },
                emerald: { 
                  bg: "bg-emerald-50/30", text: "text-emerald-700", border: "border-emerald-100", accent: "bg-emerald-100/50", 
                  btn: "bg-emerald-600 hover:bg-emerald-700", shadow: "shadow-emerald-200", glow: "group-hover:bg-emerald-500/10" 
                },
                green: { 
                  bg: "bg-green-50/30", text: "text-green-700", border: "border-green-100", accent: "bg-green-100/50", 
                  btn: "bg-green-600 hover:bg-green-700", shadow: "shadow-green-200", glow: "group-hover:bg-green-500/10" 
                },
                lime: { 
                  bg: "bg-lime-50/30", text: "text-lime-700", border: "border-lime-100", accent: "bg-lime-100/50", 
                  btn: "bg-lime-600 hover:bg-lime-700", shadow: "shadow-lime-200", glow: "group-hover:bg-lime-500/10" 
                },
                amber: { 
                  bg: "bg-amber-50/30", text: "text-amber-700", border: "border-amber-100", accent: "bg-amber-100/50", 
                  btn: "bg-amber-600 hover:bg-amber-700", shadow: "shadow-amber-200", glow: "group-hover:bg-amber-500/10" 
                },
                orange: { 
                  bg: "bg-orange-50/30", text: "text-orange-700", border: "border-orange-100", accent: "bg-orange-100/50", 
                  btn: "bg-orange-600 hover:bg-orange-700", shadow: "shadow-orange-200", glow: "group-hover:bg-orange-500/10" 
                },
                red: { 
                  bg: "bg-red-50/30", text: "text-red-700", border: "border-red-100", accent: "bg-red-100/50", 
                  btn: "bg-red-600 hover:bg-red-700", shadow: "shadow-red-200", glow: "group-hover:bg-red-500/10" 
                },
                rose: { 
                  bg: "bg-rose-50/30", text: "text-rose-700", border: "border-rose-100", accent: "bg-rose-100/50", 
                  btn: "bg-rose-600 hover:bg-rose-700", shadow: "shadow-rose-200", glow: "group-hover:bg-rose-500/10" 
                },
                pink: { 
                  bg: "bg-pink-50/30", text: "text-pink-700", border: "border-pink-100", accent: "bg-pink-100/50", 
                  btn: "bg-pink-600 hover:bg-pink-700", shadow: "shadow-pink-200", glow: "group-hover:bg-pink-500/10" 
                },
                fuchsia: { 
                  bg: "bg-fuchsia-50/30", text: "text-fuchsia-700", border: "border-fuchsia-100", accent: "bg-fuchsia-100/50", 
                  btn: "bg-fuchsia-600 hover:bg-fuchsia-700", shadow: "shadow-fuchsia-200", glow: "group-hover:bg-fuchsia-500/10" 
                },
                purple: { 
                  bg: "bg-purple-50/30", text: "text-purple-700", border: "border-purple-100", accent: "bg-purple-100/50", 
                  btn: "bg-purple-600 hover:bg-purple-700", shadow: "shadow-purple-200", glow: "group-hover:bg-purple-500/10" 
                },
                violet: { 
                  bg: "bg-violet-50/30", text: "text-violet-700", border: "border-violet-100", accent: "bg-violet-100/50", 
                  btn: "bg-violet-600 hover:bg-violet-700", shadow: "shadow-violet-200", glow: "group-hover:bg-violet-500/10" 
                },
                slate: { 
                  bg: "bg-slate-50/30", text: "text-slate-700", border: "border-slate-100", accent: "bg-slate-100/50", 
                  btn: "bg-slate-600 hover:bg-slate-700", shadow: "shadow-slate-200", glow: "group-hover:bg-slate-500/10" 
                },
              }
              const theme = themeMap[olympiad.colorTheme || "indigo"] || themeMap.indigo
              const emoji = olympiad.emoji || "🎓"

              return (
                <Card 
                  key={olympiad.id} 
                  className={`group flex flex-col border ${theme.border} shadow-sm rounded-[2rem] bg-white transition-all duration-500 hover:shadow-xl hover:${theme.shadow}/30 hover:-translate-y-1`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className={`${theme.bg} border-b ${theme.border}/50 pb-6 relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${theme.text}/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 ${theme.glow} group-hover:scale-150`}></div>
                    <div className={`w-14 h-14 rounded-2xl ${theme.accent} border ${theme.border}/30 flex items-center justify-center mb-4 text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm`}>
                      {emoji}
                    </div>
                    <CardTitle className={`text-xl font-bold line-clamp-2 leading-tight text-slate-800 group-hover:${theme.text} transition-colors duration-300`}>{olympiad.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6 space-y-4">
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed font-medium text-slate-500">
                      {olympiad.description || "Нет описания"}
                    </CardDescription>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${theme.bg} ${theme.text} text-[12px] font-bold border ${theme.border}/50 shadow-sm`}>
                      <CalendarClock className="w-4 h-4" />
                      До {new Date(olympiad.endDate).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-6 px-6">
                    {(() => {
                      const userResult = olympiad.results?.[0]
                      const isExpired = userResult && (
                        (olympiad.duration && new Date().getTime() > new Date(userResult.startedAt).getTime() + olympiad.duration * 60 * 1000) ||
                        (new Date() > new Date(olympiad.endDate))
                      )

                      if (userResult?.isSubmitted || isExpired) {
                        return (
                          <Button asChild className={`w-full h-11 rounded-xl font-black text-xs gap-2 ${theme.btn} text-white shadow-lg ${theme.shadow} transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest bg-slate-600 hover:bg-slate-700`}>
                            <Link href={userResult ? `/dashboard/results/${userResult.id}` : `/dashboard/olympiads/${olympiad.id}`}>
                              Результаты
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        )
                      }
                      
                      if (userResult) {
                        return (
                          <Button asChild className={`w-full h-11 rounded-xl font-black text-xs gap-2 ${theme.btn} text-white shadow-lg ${theme.shadow} transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest`}>
                            <Link href={`/dashboard/olympiads/${olympiad.id}/take`}>
                              Продолжить
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                        )
                      }
                      
                      return (
                        <Button asChild className={`w-full h-11 rounded-xl font-black text-xs gap-2 ${theme.btn} text-white shadow-lg ${theme.shadow} transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest`}>
                          <Link href={`/dashboard/olympiads/${olympiad.id}`}>
                            Участвовать 
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      )
                    })()}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
