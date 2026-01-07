"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clientFetch } from "@/lib/client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") {
      setOk(true);
      return;
    }

    clientFetch("/admin/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setOk(true))
      .catch(() => {
        // clientFetch handles 401 redirect, but we double down here
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  if (!ok) return null;

  return <>{children}</>;
}
