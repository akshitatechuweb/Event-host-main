import LoginPage from "@/components/pages/LoginPage";

/**
 * Login page - no SSR auth checks
 * Route protection is handled by middleware.ts
 * Client-side redirect happens after OTP success
 */
export default function LoginPageRoute() {
  return <LoginPage />;
}
