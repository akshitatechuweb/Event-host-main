import { useQuery } from "@tanstack/react-query";
import { getAdminProfile } from "@/lib/admin";

export function usePermissions() {
  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => getAdminProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isSuperAdmin = profile?.role === "superadmin";

  const hasPermission = (module: string, type: "read" | "write") => {
    if (isSuperAdmin) return true;
    if (!profile?.permissions) return false;

    // Check if the module exists in permissions
    const modulePerms = profile.permissions[module];
    if (!modulePerms) return false;

    return modulePerms[type] === true;
  };

  return {
    profile,
    isSuperAdmin,
    hasPermission,
    canRead: (module: string) => hasPermission(module, "read"),
    canWrite: (module: string) => hasPermission(module, "write"),
  };
}
