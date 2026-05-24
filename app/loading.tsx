export default function RootLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Загрузка...</p>
      </div>
    </div>
  )
}
