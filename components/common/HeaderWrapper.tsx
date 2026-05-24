"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (pathname === "/") return null;
  
  return <>{children}</>;
}
