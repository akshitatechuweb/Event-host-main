import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AuthMeResponse = {
  user?: {
    role?: string;
  };
};

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join("; ");

  if (!allCookies) {
    redirect("/login");
  }

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Cookie: allCookies,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  const data = (await res.json()) as AuthMeResponse;
  const role = data.user?.role;

  if (role !== "admin" && role !== "superadmin") {
    redirect("/login");
  }

  return <>{children}</>;
}
