"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") {
      setOk(true);
      return;
    }

    fetch("/api/admin/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setOk(true))
      .catch(() => router.replace("/admin/login"));
  }, [pathname, router]);

  if (!ok) return null;

  return <>{children}</>;
}
