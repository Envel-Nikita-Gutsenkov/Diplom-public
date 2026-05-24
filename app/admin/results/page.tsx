export const dynamic = 'force-dynamic';
import { getOlympiads } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, ChevronRight, BarChart3, Search } from "lucide-react"

export default async function AdminGlobalResultsPage() {
  const olympiads = await getOlympiads()

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Результаты и Статистика</h1>
            <p className="text-muted-foreground font-medium mt-1">Выберите олимпиаду для просмотра подробных результатов</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {olympiads.map((olympiad) => (
          <Link key={olympiad.id} href={`/admin/olympiads/${olympiad.id}/results`} className="block group">
            <Card className="h-full overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm flex flex-col rounded-[2rem]">
              <CardHeader className="pb-4 border-b border-primary/5 bg-muted/10">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={olympiad.isActive ? "default" : "secondary"} className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-2 py-0.5">
                      {olympiad.isActive ? "Активна" : "Завершена"}
                  </Badge>
                  <Trophy className="h-5 w-5 text-yellow-500/40 group-hover:text-yellow-500 transition-colors" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {olympiad.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <BarChart3 className="h-3.5 w-3.5" /> Рейтинг
                          </p>
                          <p className="text-lg font-bold text-foreground">Открыт</p>
                      </div>
                      <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> Участники
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {olympiad._count?.results || 0}
                          </p>
                      </div>
                  </div>
              </CardContent>
              <div className="p-6 bg-primary/5 group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-colors flex items-center justify-between mt-auto">
                 <span className="font-bold text-sm">Подробная аналитика</span>
                 <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
        {olympiads.length === 0 && (
            <div className="col-span-full text-center py-24 border-4 border-dashed rounded-[3rem] bg-muted/5">
                <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">Олимпиады не найдены</h3>
                <p className="text-sm text-muted-foreground/60 mt-2">Создайте олимпиаду, чтобы появились результаты.</p>
            </div>
        )}
      </div>
    </div>
  )
}
