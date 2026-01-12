"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { getAppUserById, deactivateAppUser } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function UserDetailsModal({
  userId,
  open,
  onOpenChange,
  onActionComplete,
}: {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  interface UserDetail {
    _id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    role?: string | null;
    isActive?: boolean;
    createdAt?: string | null;
    photos?: Array<{ url: string; isProfilePhoto?: boolean }>;
  }
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    getAppUserById(userId)
      .then((res) => {
        if (!mounted) return;
        if (!res?.success) throw new Error(res?.message || "Failed to fetch");
        setData(res.user);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error fetching details";
        setError(msg);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [open, userId]);

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    setActionLoading(true);
    try {
      await deactivateAppUser(userId);
      onActionComplete();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View full profile for this user.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-sidebar-primary" />
          </div>
        ) : error ? (
          <div className="py-6 text-center text-destructive">{error}</div>
        ) : data ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{data.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{data.email || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{data.phone || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{data.city || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{data.role || "user"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{data.isActive ? "Active" : "Deactivated"}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{data.createdAt ? new Date(data.createdAt).toLocaleString() : "—"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No details available</div>
        )}

        <DialogFooter>
          <div className="flex items-center gap-2 w-full">
            <div className="ml-auto flex items-center gap-2">
              {data && data.isActive && (
                <Button variant="ghost" onClick={handleDeactivate} disabled={actionLoading} className="text-red-500">
                  {actionLoading ? "Processing..." : "Deactivate"}
                </Button>
              )}

              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
