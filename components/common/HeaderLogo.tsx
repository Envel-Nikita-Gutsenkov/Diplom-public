"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
      <span>Олимпиада</span>
    </Link>
  );
}
