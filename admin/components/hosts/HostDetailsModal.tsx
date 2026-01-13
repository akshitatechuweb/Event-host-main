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
import { getHostById, approveHost, rejectHost } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
interface HostDetail {
  userId?: {
    name?: string;
    phone?: string;
    email?: string;
    documents?: {
      aadhaar?: string;
      pan?: string;
      drivingLicense?: string;
    } | null;
    photos?: { url: string; isProfilePhoto?: boolean }[] | null;
  } | null;
  preferredPartyDate?: string | null;
  locality?: string | null;
  city?: string | null;
  pincode?: string | null;
  status?: "pending" | "approved" | "rejected" | string;
  rejectionReason?: string | null;
  reviewedBy?: { name?: string; email?: string } | null;
}

export default function HostDetailsModal({
  hostId,
  open,
  onOpenChange,
  onActionComplete,
}: {
  hostId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    getHostById(hostId)
      .then((res) => {
        if (!mounted) return;
        if (!res?.success) throw new Error(res?.message || "Failed to fetch");
        setData(res.request as HostDetail);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error fetching details";
        setError(msg);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [open, hostId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveHost(hostId);
      onActionComplete();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this host request?")) return;
    setActionLoading(true);
    try {
      await rejectHost(hostId);
      // Optionally send reason to server in future; currently server supports reason on different endpoint
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Host Request Details</DialogTitle>
          <DialogDescription>
            Review the host request and approve or reject with confidence.
          </DialogDescription>
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
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{data.userId?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{data.userId?.phone || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{data.city || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Locality / Pincode</p>
                <p className="font-medium">{data.locality || "—"} / {data.pincode || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Preferred Date</p>
                <p className="font-medium">{data.preferredPartyDate ? new Date(data.preferredPartyDate).toLocaleDateString() : "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{data.status}</p>
              </div>

              {data.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                  <p className="font-medium">{data.rejectionReason}</p>
                </div>
              )}

              {data.reviewedBy && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Reviewed By</p>
                  <p className="font-medium">{data.reviewedBy.name} — {data.reviewedBy.email}</p>
                </div>
              )}
            </div>

            {/* Photos Section */}
            {(data.userId?.photos?.length ?? 0) > 0 && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-muted-foreground">Host Photos</p>
                <div className="flex flex-wrap gap-2">
                  {data.userId?.photos?.map((photo, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border border-border">
                      <img
                        src={photo.url}
                        alt={`Host photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {photo.isProfilePhoto && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
                          Profile
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {data.userId?.documents && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-muted-foreground">Verification Documents</p>
                <div className="grid grid-cols-3 gap-3">
                  {data.userId.documents.aadhaar && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Aadhaar</p>
                      <div className="w-full h-32 rounded-md overflow-hidden border border-border">
                        <img
                          src={data.userId.documents.aadhaar}
                          alt="Aadhaar"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                          onClick={() => window.open(data.userId?.documents?.aadhaar || "", "_blank")}
                        />
                      </div>
                    </div>
                  )}
                  {data.userId.documents.pan && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">PAN</p>
                      <div className="w-full h-32 rounded-md overflow-hidden border border-border">
                        <img
                          src={data.userId.documents.pan}
                          alt="PAN"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                          onClick={() => window.open(data.userId?.documents?.pan || "", "_blank")}
                        />
                      </div>
                    </div>
                  )}
                  {data.userId.documents.drivingLicense && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Driving License</p>
                      <div className="w-full h-32 rounded-md overflow-hidden border border-border">
                        <img
                          src={data.userId.documents.drivingLicense}
                          alt="Driving License"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                          onClick={() => window.open(data.userId?.documents?.drivingLicense || "", "_blank")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No details available</div>
        )}

        <DialogFooter>
          <div className="flex items-center gap-2 w-full">
            <div className="ml-auto flex items-center gap-2">
              {data?.status === "pending" && (
                <>
                  <Button variant="ghost" onClick={handleReject} disabled={actionLoading} className="text-red-500">
                    {actionLoading ? "Processing..." : "Reject"}
                  </Button>
                  <Button onClick={handleApprove} disabled={actionLoading} className="text-emerald-600">
                    {actionLoading ? "Processing..." : "Approve"}
                  </Button>
                </>
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