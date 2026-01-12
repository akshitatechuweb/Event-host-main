"use client";

import { Suspense, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAllAppUsers, deactivateAppUser } from "@/lib/admin";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Mail, 
  MapPin, 
  ShieldAlert,
  Clock,
  Filter,
  UserCheck,
  UserMinus,
  Loader2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

interface AppUser {
  _id: string;
  name?: string;
  email?: string;
  city?: string;
  gender?: string;
  isActive: boolean;
}

function AppUsersContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading } = useQuery({
    queryKey: ["app-users", page, limit],
    queryFn: () => getAllAppUsers(page, limit),
  });

  const users = (data?.users || []) as AppUser[];
  const meta = data?.meta;

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      await deactivateAppUser(id);
      toast.success("User deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["app-users"] });
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.city?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGender = genderFilter === "all" || user.gender?.toLowerCase() === genderFilter.toLowerCase();
      
      return matchesSearch && matchesGender;
    });
  }, [users, searchQuery, genderFilter]);

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sidebar-primary to-pink-500 bg-clip-text text-transparent inline-block">
            App Users
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and monitor registered community members
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card border border-sidebar-border px-6 py-4 rounded-2xl shadow-sm">
          <div className="text-center px-4">
            <p className="text-2xl font-bold">{meta?.totalItems || users.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Members</p>
          </div>
          <div className="h-10 w-[1px] bg-sidebar-border mx-2" />
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-red-500">{users.filter(u => !u.isActive).length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">On Page Inactive</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, email or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-sidebar-border bg-card/60 focus:ring-2 focus:ring-sidebar-primary/30 focus:border-sidebar-primary outline-none transition-smooth shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-card border border-sidebar-border px-4 py-1 rounded-2xl shadow-sm min-w-[200px]">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select 
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-transparent py-2.5 outline-none w-full text-sm font-medium"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-sidebar-border rounded-3xl shadow-xl overflow-hidden glass-morphism">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black border-b border-sidebar-border">
                <th className="px-8 py-5">Full Name</th>
                <th className="px-6 py-5">Email Address</th>
                <th className="px-6 py-5">City</th>
                <th className="px-6 py-5">Gender</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sidebar-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Clock className="h-10 w-10 text-sidebar-primary animate-pulse" />
                      <p className="text-muted-foreground font-medium">Synchronizing database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Users className="h-12 w-12 text-muted-foreground/20" />
                      <p className="text-muted-foreground font-medium">No members found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/20 transition-smooth group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-card-foreground">{user.name || "N/A"}</p>
                    </td>
                    <td className="px-6 py-6 font-medium text-muted-foreground/80">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-pink-500/40" />
                        {user.email || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <MapPin className="h-3.5 w-3.5 text-sidebar-primary/40" />
                        {user.city || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${user.gender?.toLowerCase() === 'male' ? 'bg-blue-500/10 text-blue-500' : 
                          user.gender?.toLowerCase() === 'female' ? 'bg-pink-500/10 text-pink-500' : 
                          'bg-muted text-muted-foreground'}`}>
                        {user.gender ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {user.isActive ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase transition-all group-hover:bg-green-500 group-hover:text-white">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase">
                          <UserMinus className="h-3 w-3" />
                          Deactivated
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user.isActive && (
                        <button 
                          onClick={() => handleDeactivate(user._id)}
                          className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-smooth group/btn border border-transparent hover:border-red-500/20"
                          title="Deactivate Member"
                        >
                          <ShieldAlert className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-sidebar-border/50 bg-muted/30">
            <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppUsersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
        </div>
      }>
        <AppUsersContent />
      </Suspense>
    </DashboardLayout>
  );
}
