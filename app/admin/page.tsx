export const dynamic = 'force-dynamic';
import Link from "next/link"
import { getOlympiads } from "@/app/actions/olympiad"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Layers, Plus, Search, Users } from "lucide-react"
import { AdminFilters } from "@/components/admin/AdminFilters"

export default async function AdminDashboard(props: any) {
  const searchParams = await props.searchParams
  const status = searchParams?.status
  let olympiads = await getOlympiads()

  const now = new Date()
  if (status === "active") {
    olympiads = olympiads.filter(o => o.isActive && new Date(o.endDate) >= now)
  } else if (status === "draft") {
    olympiads = olympiads.filter(o => !o.isActive)
  } else if (status === "completed") {
    olympiads = olympiads.filter(o => new Date(o.endDate) < now)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Панель управления</h1>
            <p className="text-muted-foreground font-medium mt-1">Список активных и запланированных олимпиад</p>
        </div>
        <Button size="lg" className="rounded-2xl font-bold shadow-md shadow-primary/10 gap-2 transition-all hover:scale-[1.02]" asChild>
          <Link href="/admin/create">
            <Plus className="h-5 w-5" /> Создать олимпиаду
          </Link>
        </Button>
      </div>

      <AdminFilters />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {olympiads.map((olympiad) => (
          <Card key={olympiad.id} className="group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm flex flex-col rounded-[2rem]">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={olympiad.isActive ? "default" : "secondary"} className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-2 py-0.5">
                    {olympiad.isActive ? "Активна" : "Черновик"}
                </Badge>
                <Layers className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{olympiad.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-sm italic font-medium opacity-80">{olympiad.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(olympiad.startDate).toLocaleDateString("ru-RU")}</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                    <Users className="h-3 w-3 text-primary" />
                    <span className="text-primary">{(olympiad as any)._count?.results || 0} уч.</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${olympiad.isActive ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "bg-muted-foreground/20"}`} style={{ width: olympiad.isActive ? "100%" : "0%" }}></div>
              </div>
            </CardContent>
            <div className="mt-auto p-6 pt-0">
               <Button asChild variant="secondary" className="w-full font-bold rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary hover:text-primary-foreground transition-all">
                <Link href={`/admin/olympiads/${olympiad.id}`}>Управление</Link>
              </Button>
            </div>
          </Card>
        ))}
        {olympiads.length === 0 && (
            <div className="col-span-full text-center py-24 border-4 border-dashed rounded-[3rem] bg-muted/5">
                <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground">Олимпиады не найдены</h3>
                <p className="text-sm text-muted-foreground/60 mt-2">Попробуйте изменить фильтры или создать новую олимпиаду.</p>
            </div>
        )}
      </div>
    </div>
  )
}
