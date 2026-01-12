"use client";

import { Suspense, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  getAllAdminHandles,
  createAdminHandle,
  updateAdminHandle,
  deleteAdminHandle,
} from "@/lib/admin";
import { toast } from "sonner";
import {
  ShieldCheck,
  Plus,
  Search,
  Mail,
  Phone,
  Settings2,
  Trash2,
  Lock,
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Permission {
  read: boolean;
  write: boolean;
}

interface AdminPermissions {
  users: Permission;
  hosts: Permission;
  events: Permission;
  transactions: Permission;
  tickets: Permission;
  [key: string]: Permission;
}

interface Admin {
  _id: string;
  name?: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  permissions: AdminPermissions;
  createdAt: string;
  // Plaintext password fields (nullable) — visible only to superadmin
  passwordPlain?: string | null;
  previousPasswordPlain?: string | null;
}

const MODULES = ["users", "hosts", "events", "transactions", "tickets"];

function AdminsContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;
  const queryClient = useQueryClient();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admins", page],
    queryFn: () => getAllAdminHandles(page, limit),
  });

  const admins = (data?.admins || []) as Admin[];
  const totalPages = data?.pagination?.totalPages || 1;

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone.includes(searchQuery)
  );

  const toggleShowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this admin handle? They will be demoted to a regular user."
      )
    )
      return;
    try {
      await deleteAdminHandle(id);
      toast.success("Admin handle removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete admin");
    }
  };

  const toggleAdminStatus = async (admin: Admin) => {
    try {
      await updateAdminHandle(admin._id, { isActive: !admin.isActive });
      toast.success(
        `Admin ${admin.isActive ? "deactivated" : "activated"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to update admin");
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sidebar-primary/10 text-sidebar-primary shadow-sm border border-sidebar-primary/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-sidebar-primary to-indigo-600 bg-clip-text text-transparent">
              Admin Management
            </h1>
          </div>
          <p className="text-muted-foreground text-lg ml-1">
            Create and manage administrative handles with granular data access
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAdmin(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-sidebar-primary text-white font-bold shadow-lg shadow-sidebar-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
        >
          <UserPlus className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span>New Admin Handle</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-sidebar-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-sidebar-border bg-card/60 focus:ring-2 focus:ring-sidebar-primary/20 focus:border-sidebar-primary outline-none transition-all shadow-sm group-hover:bg-card duration-300"
          />
        </div>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-card/30 rounded-3xl border-2 border-dashed border-sidebar-border">
            <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
            <p className="text-muted-foreground font-medium">
              Fetching secure handles...
            </p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-card/30 rounded-3xl border-2 border-dashed border-sidebar-border">
            <div className="inline-flex p-4 rounded-full bg-muted/30">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">
              No administrative handles found
            </p>
          </div>
        ) : (
          filteredAdmins.map((admin) => (
            <div
              key={admin._id}
              className={cn(
                "group relative bg-card border border-sidebar-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-sidebar-primary/5 transition-all duration-500 overflow-hidden",
                !admin.isActive && "opacity-75 grayscale-[0.5]"
              )}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-2xl font-black text-muted-foreground/40 border-2 border-sidebar-border/50 group-hover:scale-110 transition-transform duration-500">
                    {admin.name ? (
                      admin.name[0].toUpperCase()
                    ) : (
                      <Lock className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {admin.name || "Unnamed Admin"}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                        <Mail className="h-3 w-3" />
                        {admin.email}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                        <Phone className="h-3 w-3" />
                        {admin.phone}
                      </div>

                      {/* Passwords (Visible only to superadmin via API) */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/30 border border-sidebar-border/40 text-[12px] font-bold">
                          <span className="uppercase tracking-wide text-muted-foreground/80">Prev</span>
                          <span className="font-mono text-sm">{admin.previousPasswordPlain ? (visiblePasswords[admin._id] ? admin.previousPasswordPlain : '••••••••') : 'Not stored'}</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/30 border border-sidebar-border/40 text-[12px] font-bold">
                          <span className="uppercase tracking-wide text-muted-foreground/80">Now</span>
                          <span className="font-mono text-sm">{admin.passwordPlain ? (visiblePasswords[admin._id] ? admin.passwordPlain : '••••••••') : 'Not stored'}</span>
                          {admin.passwordPlain ? (
                            <button
                              onClick={() => toggleShowPassword(admin._id)}
                              className="p-1 rounded-md ml-2 bg-muted/20 hover:bg-muted/40"
                              title={visiblePasswords[admin._id] ? 'Hide' : 'Show'}
                            >
                              {visiblePasswords[admin._id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      admin.isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}
                  >
                    {admin.isActive ? "Active" : "Disabled"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
                    Created {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {MODULES.map((module) => (
                  <div
                    key={module}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-sidebar-border/30 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-[8px] uppercase tracking-widest font-black text-muted-foreground/80 truncate w-full text-center">
                      {module}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        title="Read"
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          admin.permissions[module]?.read
                            ? "bg-sidebar-primary"
                            : "bg-muted-foreground/20"
                        )}
                      />
                      <div
                        title="Write"
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          admin.permissions[module]?.write
                            ? "bg-orange-500"
                            : "bg-muted-foreground/20"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-muted/50 hover:bg-sidebar-primary/10 hover:text-sidebar-primary border border-sidebar-border transition-all duration-300 font-bold text-sm"
                >
                  <Settings2 className="h-4 w-4" />
                  Update Handle
                </button>
                <button
                  onClick={() => toggleAdminStatus(admin)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all duration-300",
                    admin.isActive
                      ? "hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border-transparent hover:border-red-500/20"
                      : "hover:bg-green-500/10 text-muted-foreground hover:text-green-500 border-transparent hover:border-green-500/20"
                  )}
                  title={admin.isActive ? "Deactivate" : "Activate"}
                >
                  {admin.isActive ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="p-3.5 rounded-2xl hover:bg-red-500/10 text-muted-foreground hover:text-red-600 border border-transparent hover:border-red-500/20 transition-all duration-300"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          className="px-4 py-2 rounded-lg border border-sidebar-border bg-card/60 hover:bg-muted"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isLoading}
        >
          Previous
        </button>

        <div className="px-4 py-2 rounded-lg text-muted-foreground">Page {page} of {totalPages}</div>

        <button
          className="px-4 py-2 rounded-lg border border-sidebar-border bg-card/60 hover:bg-muted"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || isLoading}
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <AdminHandleModal
          admin={selectedAdmin}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admins", page] });
          }}
        />
      )}
    </div>
  );
}

function AdminHandleModal({
  admin,
  onClose,
  onSuccess,
}: {
  admin: Admin | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    password: "",
    permissions:
      admin?.permissions ||
      MODULES.reduce((acc: any, mod) => {
        acc[mod] = { read: true, write: false };
        return acc;
      }, {}),
  });

  // Show/hide password toggles in modal
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (admin) {
        // Only include password if filled
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        await updateAdminHandle(admin._id, payload);
        toast.success("Admin handle updated successfully");
      } else {
        if (!formData.password)
          throw new Error("Password is required for new handle");
        await createAdminHandle(formData);
        toast.success("Admin handle created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (module: string, type: "read" | "write") => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [type]: !prev.permissions[module][type],
        },
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-card border border-sidebar-border w-full max-w-md rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-auto animate-in slide-in-from-bottom-8 duration-500">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight">
              {admin ? "Update Access" : "Create Handle"}
            </h2>
            <p className="text-muted-foreground text-sm">
              Define identity and system permissions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-muted/40 border border-sidebar-border focus:ring-2 focus:ring-sidebar-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-muted/40 border border-sidebar-border focus:ring-2 focus:ring-sidebar-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="10-digit phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-5 py-4 rounded-2xl bg-muted/40 border border-sidebar-border focus:ring-2 focus:ring-sidebar-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                {admin ? "Change Password (optional)" : "Secure Password"}
              </label>
              <input
                type="password"
                required={!admin}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-5 py-4 rounded-2xl bg-muted/40 border border-sidebar-border focus:ring-2 focus:ring-sidebar-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                System Permissions
              </label>
              <div className="space-y-2.5">
                {MODULES.map((module) => (
                  <div
                    key={module}
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-sidebar-border/50"
                  >
                    <span className="text-sm font-bold capitalize">
                      {module}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => togglePermission(module, "read")}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          formData.permissions[module].read
                            ? "bg-sidebar-primary text-white"
                            : "bg-muted text-muted-foreground opacity-50"
                        )}
                      >
                        Read
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePermission(module, "write")}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          formData.permissions[module].write
                            ? "bg-orange-600 text-white"
                            : "bg-muted text-muted-foreground opacity-50"
                        )}
                      >
                        Write
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl border border-sidebar-border font-bold hover:bg-muted transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-2 py-4 rounded-2xl bg-sidebar-primary text-white font-black shadow-xl shadow-sidebar-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : admin ? (
                  "Update Handle"
                ) : (
                  "Create Handle"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
          </div>
        }
      >
        <AdminsContent />
      </Suspense>
    </DashboardLayout>
  );
}
