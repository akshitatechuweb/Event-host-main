import { redirect } from "next/navigation";
import LoginPage from "@/components/pages/LoginPage";
import { checkAuth } from "@/lib/auth-utils";

export default async function LoginPageRoute() {
  // Check if user is already authenticated
  const authResult = await checkAuth();

  if (authResult.success && authResult.user) {
    const role = authResult.user.role;

    // Already logged-in admin → go to dashboard
    if (role === "admin" || role === "superadmin") {
      redirect("/dashboard");
    }
  }

  // Not logged in → show login
  return <LoginPage />;
}
