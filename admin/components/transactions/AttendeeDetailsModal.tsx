"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Attendee } from "@/types/transaction";
import {
  User,
  Mail,
  Phone,
  Ticket,
  Venus,
  Mars,
  HelpCircle,
} from "lucide-react";

interface AttendeeDetailsModalProps {
  attendees: Attendee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AttendeeDetailsModal({
  attendees,
  open,
  onOpenChange,
}: AttendeeDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/50 shadow-2xl rounded-3xl overflow-hidden glass-morphism p-0 gap-0">
        <DialogHeader className="p-8 pb-4 bg-linear-to-r from-sidebar-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sidebar-primary/10 text-sidebar-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Attendee Information
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Total {attendees.length}{" "}
                {attendees.length === 1 ? "guest" : "guests"} attending
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid gap-6">
            {attendees.map((attendee, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-border/50 bg-muted/30 p-5 transition-all duration-300 hover:bg-muted/50 hover:border-sidebar-primary/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-background border border-border/50">
                      {attendee.gender === "Male" ? (
                        <Mars className="h-4 w-4 text-blue-500" />
                      ) : attendee.gender === "Female" ? (
                        <Venus className="h-4 w-4 text-pink-500" />
                      ) : (
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {attendee.fullName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Ticket className="h-3.5 w-3.5 text-sidebar-primary" />
                        <span className="text-xs font-medium text-sidebar-primary uppercase tracking-wider">
                          {attendee.passType} Pass
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-background border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    #{index + 1}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-background border border-border/40">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </div>
                    <span className="text-sm text-muted-foreground truncate hover:text-foreground transition-colors">
                      {attendee.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-background border border-border/40">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {attendee.phone}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
