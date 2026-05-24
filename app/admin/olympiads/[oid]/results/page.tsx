export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getOlympiadById } from "@/app/actions/olympiad"
import { getOlympiadResults } from "@/app/actions/analytics"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft, User, ChevronRight, Trophy, BarChart3, RotateCcw } from "lucide-react"
import { ExportCsvButton } from "@/components/admin/ExportCsvButton"
import { UserResultResetButton } from "@/components/admin/UserResultResetButton"

export default async function OlympiadResultsPage({ params }: { params: Promise<{ oid: string }> }) {
  const { oid: id } = await params
  console.log(`[RESULTS] Fetching for ID: ${id}`)
  const olympiad = await getOlympiadById(id)
  if (!olympiad) {
    console.error(`[RESULTS] Olympiad not found for ID: ${id}`)
    notFound()
  }

  const results = await getOlympiadResults(id)

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/olympiads/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Результаты</h1>
            <p className="text-muted-foreground italic">{olympiad.title}</p>
          </div>
        </div>
        <ExportCsvButton results={results} olympiadTitle={olympiad.title} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/10">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-70">Участников</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-foreground/80">{results.length}</div>
              </CardContent>
          </Card>
          <Card className="bg-yellow-500/5 border-yellow-500/10">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-70">Средний балл</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-foreground/80">
                      {results.length > 0 ? (results.reduce((acc: number, r: any) => acc + r.totalScore, 0) / results.length).toFixed(1) : 0}
                  </div>
              </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/10">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-70">Макс. балл</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-foreground/80">
                      {results.length > 0 ? Math.max(...results.map((r: any) => r.totalScore)) : 0}
                  </div>
              </CardContent>
          </Card>
      </div>

      {results.length > 0 && (
        <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Распределение баллов
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-2 h-40">
                {(() => {
                    const maxScore = Math.max(...results.map((r: any) => r.totalScore), 1);
                    const bins = Array(10).fill(0);
                    results.forEach((r: any) => {
                        const binIndex = Math.min(Math.floor((r.totalScore / maxScore) * 10), 9);
                        bins[binIndex]++;
                    });
                    const maxBin = Math.max(...bins, 1);
                    return bins.map((count, i) => (
                        <div key={i} className="flex flex-col flex-1 items-center justify-end h-full gap-2 group">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-muted-foreground">
                                {count} чел.
                            </div>
                            <div 
                                className="w-full bg-primary/20 group-hover:bg-primary transition-colors rounded-t-md relative overflow-hidden" 
                                style={{ height: `${(count / maxBin) * 100}%`, minHeight: count > 0 ? "4px" : "1px" }}
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/40" />
                            </div>
                            <div className="text-[10px] text-muted-foreground/60 w-full text-center border-t pt-1">
                                {Math.round((i / 10) * maxScore)}-{Math.round(((i + 1) / 10) * maxScore)}
                            </div>
                        </div>
                    ));
                })()}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Список участников</CardTitle>
          <CardDescription>Рейтинг по количеству набранных баллов</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 text-center font-bold">Место</TableHead>
                <TableHead className="font-bold">Участник</TableHead>
                <TableHead className="font-bold text-center">Группа</TableHead>
                <TableHead className="font-bold text-center">Баллы</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result: any, idx: number) => (
                <TableRow key={result.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell className="text-center font-bold text-lg text-foreground/80">
                    {idx === 0 ? <Trophy className="h-5 w-5 text-yellow-500 mx-auto" /> : idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                          {result.user.image ? (
                              <img src={result.user.image} alt="" className="h-full w-full rounded-full" />
                          ) : (
                              <User className="h-4 w-4 text-primary/40" />
                          )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm leading-none">{result.user.name || "Без имени"}</p>
                           {result.violations && result.violations.length > 0 && (
                             <Badge variant="destructive" className="h-6 px-2 text-[10px] font-black animate-pulse shadow-lg shadow-destructive/20 border-none">
                               {result.violations.length} {result.violations.length === 1 ? 'нарушение' : 'нарушений'}
                             </Badge>
                           )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight font-medium opacity-60">{result.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-bold px-2 py-1 bg-muted rounded-lg border border-primary/5">{result.user.group || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="px-3 py-0.5 font-bold text-sm bg-primary/5 text-primary border-primary/10 rounded-md">
                        {result.totalScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 flex items-center justify-end gap-2">
                    <UserResultResetButton 
                      olympiadId={id} 
                      userId={result.user.id} 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <Button variant="outline" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 font-bold">
                        <Link href={`/admin/olympiads/${id}/results/${result.user.id}`}>
                            Ответы <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                    Результатов пока нет. Олимпиада еще не завершена или никто не участвовал.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
