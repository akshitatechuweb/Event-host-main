import { redirect } from "next/navigation";

// Root page redirects to dashboard (which is protected)
export default function HomePage() {
  redirect("/dashboard");
}
