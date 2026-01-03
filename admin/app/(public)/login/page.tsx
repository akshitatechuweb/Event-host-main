import { redirect } from "next/navigation";
import LoginPage from "@/components/pages/LoginPage";
import { checkAuth } from "@/lib/auth-utils";

export default async function LoginPageRoute() {
  try {
    // Check if user is already authenticated
    // If checkAuth fails (no token, network error, etc.), we still show login page
    const authResult = await checkAuth();

    // Only redirect if we have a successful auth with admin role
    if (authResult.success && authResult.user) {
      const role = authResult.user.role;

      // Already logged-in admin → go to dashboard
      if (role === "admin" || role === "superadmin") {
        redirect("/dashboard");
      }
    }
  } catch (error) {
    // If auth check fails for any reason, just show login page
    // This ensures login page is always accessible
    console.error("Login page auth check error (non-fatal):", error);
  }

  // Not logged in or auth check failed → show login
  return <LoginPage />;
}
