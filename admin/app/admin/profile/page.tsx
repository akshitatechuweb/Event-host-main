"use client";

import { useState, useEffect, useRef } from "react";
import { clientFetch } from "@/lib/client";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  Lock,
  Loader2,
  Save,
  KeyRound,
  Check,
} from "lucide-react";
import { SecureImageUpload } from "@/components/common/SecureImageUpload";
import { CldImage } from "@/components/common/CldImage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from "@/lib/admin";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePhoto: string | null;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();

  // Profile fields state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [cloudinaryData, setCloudinaryData] = useState<{ url: string; publicId: string; version: string } | null>(null);

  // Password fields state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Fetch Profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
  });

  // Sync profile data to local state for editing
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMobile(profile.phone || "");
      // If profile.profilePhoto is a string (old format) or object (new format)
      // CldImage handles it, but for the upload component we might need just the URL for preview
    }
  }, [profile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      setCloudinaryData(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: updateAdminPassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to change password");
    },
  });



  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      name,
      phone: mobile,
    };

    if (cloudinaryData) {
      payload.profilePhoto = cloudinaryData;
    }

    updateProfileMutation.mutate(payload);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sidebar-primary to-pink-500 bg-clip-text text-transparent inline-block">
          Admin Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card & Photo */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card border border-sidebar-border rounded-2xl p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sidebar-primary to-pink-500" />

            <div className="flex flex-col items-center pt-4">
              <div className="relative group">
                <CldImage
                  src={cloudinaryData || profile?.profilePhoto}
                  transformation="avatar"
                  alt="Profile"
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-full border-4 border-background shadow-lg overflow-hidden bg-muted flex items-center justify-center object-cover"
                />
                
                <div className="absolute -bottom-2 -right-2">
                   <SecureImageUpload
                     folder={`users/${profile?.id || 'admin'}/avatar`}
                     onSuccess={(data) => setCloudinaryData(data)}
                     label=""
                     className="w-12"
                   >
                     <div className="h-10 w-10 bg-sidebar-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <Camera className="h-5 w-5" />
                     </div>
                   </SecureImageUpload>
                </div>
              </div>

              <h2 className="mt-4 text-xl font-bold">
                {profile?.name || "UnrealAdmin"}
              </h2>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20">
                  <ShieldCheck className="h-3 w-3" />
                  {profile?.role === "superadmin"
                    ? "Super Admin"
                    : "Administrator"}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm text-muted-foreground border-t border-sidebar-border pt-6">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>{profile?.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile & Password */}
        <div className="md:col-span-2 space-y-8">
          {/* Basic Details Form */}
          <div className="bg-card border border-sidebar-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-sidebar-border bg-muted/30">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-sidebar-primary" />
                <h3 className="font-semibold text-card-foreground">
                  Profile Details
                </h3>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-background/50 focus:ring-2 focus:ring-sidebar-primary/50 focus:border-sidebar-primary outline-none transition-smooth"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-background/50 focus:ring-2 focus:ring-sidebar-primary/50 focus:border-sidebar-primary outline-none transition-smooth"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 opacity-70">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.email || ""}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-muted cursor-not-allowed outline-none"
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="space-y-2 opacity-70">
                  <label className="text-sm font-medium">Role</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        profile?.role === "superadmin" ? "Super Admin" : "Admin"
                      }
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-muted cursor-not-allowed outline-none"
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 bg-sidebar-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-sidebar-primary/20 transition-smooth disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form (Super Admin Only) */}
          {profile?.role === "superadmin" && (
            <div className="bg-card border border-sidebar-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-sidebar-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-sidebar-primary" />
                  <h3 className="font-semibold text-card-foreground">
                    Security
                  </h3>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-background/50 focus:ring-2 focus:ring-sidebar-primary/50 focus:border-sidebar-primary outline-none transition-smooth"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords({ ...passwords, new: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-background/50 focus:ring-2 focus:ring-sidebar-primary/50 focus:border-sidebar-primary outline-none transition-smooth"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords({
                            ...passwords,
                            confirm: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-sidebar-border bg-background/50 focus:ring-2 focus:ring-sidebar-primary/50 focus:border-sidebar-primary outline-none transition-smooth"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-2 bg-foreground text-background dark:bg-white dark:text-black px-6 py-2.5 rounded-xl font-medium shadow-lg transition-smooth disabled:opacity-50"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
