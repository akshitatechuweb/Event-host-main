import LoginPage from "@/components/pages/LoginPage";

// Login route is public; auth redirect is handled centrally in proxy.ts
export default function Page() {
  return <LoginPage />;
}
