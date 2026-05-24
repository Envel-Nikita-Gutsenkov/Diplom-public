import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOutAction } from "@/app/actions/auth"
import { getGlobalSettings } from "@/app/actions/settings"
import { HeaderLogo } from "./HeaderLogo"
import Link from "next/link"

export async function Header() {
  const session = await auth()
  const settings = await getGlobalSettings()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl transition-all duration-300">
      <div className="w-full px-5 flex h-16 items-center justify-between">
        <HeaderLogo />

        <nav className="flex items-center gap-3">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-105 transition-transform">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="bg-muted font-bold">{session.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard" className="w-full">Личный кабинет</Link>
                </DropdownMenuItem>
                {(session?.user as any)?.role === "ADMIN" && (
                   <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/admin" className="w-full">Админ панель</Link>
                   </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-destructive focus:text-destructive">
                  <form action={signOutAction} className="w-full">
                    <button type="submit" className="w-full text-left font-medium">
                      Выйти из системы
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-full font-medium">
                    <Link href="/login">Войти</Link>
                </Button>
                {settings?.registrationEnabled && (
                  <Button asChild className="rounded-full shadow-none hover:scale-105 transition-transform font-bold">
                      <Link href="/register">Регистрация</Link>
                  </Button>
                )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
