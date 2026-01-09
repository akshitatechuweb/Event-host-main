"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { StepBasics } from "./steps/StepBasics";
import { StepSchedule } from "./steps/StepSchedule";
import { StepDescription } from "./steps/StepDescription";
import { StepPasses } from "./steps/StepPasses";
import { StepRules } from "./steps/StepRules";
import { getApprovedHosts } from "@/lib/admin";

interface AdminEventForForm {
  _id: string;
  eventName?: string;
  hostId?: string | { _id?: string };
  hostedBy?: string;
  subtitle?: string;
  category?: string | string[];
  eventImage?: string | null;
  date?: string | Date;
  time?: string;
  fullAddress?: string;
  city?: string;
  about?: string;
  partyFlow?: string;
  whatsIncluded?: string;
  howItWorks?: string;
  whatsIncludedInTicket?: string;
  passes?: EventFormData["passes"];
  ageRestriction?: string;
  maxCapacity?: number;
  expectedGuestCount?: string;
  maleToFemaleRatio?: string;
  thingsToKnow?: string;
  partyEtiquette?: string;
  houseRules?: string;
  partyTerms?: string;
  cancellationPolicy?: string;
}

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
  editingEvent?: AdminEventForForm | null;
  onEventUpdated?: () => void;
}

export interface EventFormData {
  eventName: string;
  hostId?: string | null;
  hostedBy: string;
  subtitle: string;
  category: string;
  eventImage: File | null;
  existingEventImage: string | null;
  date: string;
  time: string;
  fullAddress: string;
  city: string;
  about: string;
  partyFlow: string;
  whatsIncluded: string;
  howItWorks: string;
  whatsIncludedInTicket: string;
  passes: Array<{
    type: "Male" | "Female" | "Couple";
    price: number;
    totalQuantity: number;
  }>;
  ageRestriction: string;
  maxCapacity: number;
  expectedGuestCount: string;
  maleToFemaleRatio: string;
  thingsToKnow: string;
  partyEtiquette: string;
  houseRules: string;
  partyTerms: string;
  cancellationPolicy: string;
}

const steps = [
  "Event identity",
  "Time & location",
  "Descriptions",
  "Passes & pricing",
  "Limits & policies",
];

// All authenticated mutations go through the Next.js API routes so that
// the JWT cookie only needs to exist on the admin domain and can still be
// forwarded securely to the backend.

export default function AddEventModal({
  open,
  onClose,
  onEventCreated,
  editingEvent,
  onEventUpdated,
}: AddEventModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const initialFormState: EventFormData = useMemo(() => ({
    eventName: "",
    hostId: null,
    hostedBy: "",
    subtitle: "",
    category: "",
    eventImage: null,
    existingEventImage: null,
    date: "",
    time: "",
    fullAddress: "",
    city: "",
    about: "",
    partyFlow: "",
    whatsIncluded: "",
    howItWorks: "",
    whatsIncludedInTicket: "",
    passes: [],
    ageRestriction: "",
    maxCapacity: 0,
    expectedGuestCount: "",
    maleToFemaleRatio: "",
    thingsToKnow: "",
    partyEtiquette: "",
    houseRules: "",
    partyTerms: "",
    cancellationPolicy: "",
  }), []);

  const [formData, setFormData] = useState<EventFormData>(initialFormState);

  useEffect(() => {
    if (editingEvent) {
      setStep(1);
      setFormData({
        eventName: editingEvent.eventName || "",
        hostId:
          typeof editingEvent.hostId === "string"
            ? editingEvent.hostId
            : editingEvent.hostId?._id || null,
        hostedBy: editingEvent.hostedBy || "",
        subtitle: editingEvent.subtitle || "",
        category: Array.isArray(editingEvent.category)
          ? editingEvent.category.join(",")
          : editingEvent.category || "",
        eventImage: null,
        existingEventImage: editingEvent.eventImage || null,
        date: editingEvent.date
          ? new Date(editingEvent.date).toISOString().split("T")[0]
          : "",
        time: editingEvent.time || "",
        fullAddress: editingEvent.fullAddress || "",
        city: editingEvent.city || "",
        about: editingEvent.about || "",
        partyFlow: editingEvent.partyFlow || "",
        whatsIncluded: editingEvent.whatsIncluded || "",
        howItWorks: editingEvent.howItWorks || "",
        whatsIncludedInTicket: editingEvent.whatsIncludedInTicket || "",
        passes: editingEvent.passes || [],
        ageRestriction: editingEvent.ageRestriction || "",
        maxCapacity: editingEvent.maxCapacity || 0,
        expectedGuestCount: editingEvent.expectedGuestCount || "",
        maleToFemaleRatio: editingEvent.maleToFemaleRatio || "",
        thingsToKnow: editingEvent.thingsToKnow || "",
        partyEtiquette: editingEvent.partyEtiquette || "",
        houseRules: editingEvent.houseRules || "",
        partyTerms: editingEvent.partyTerms || "",
        cancellationPolicy: editingEvent.cancellationPolicy || "",
      });
    } else if (open) {
      setFormData(initialFormState);
      setStep(1);
    }
  }, [editingEvent, open, initialFormState]);

  const [hosts, setHosts] = useState<
    Array<{ hostId: string; name: string; city?: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getApprovedHosts();
        if (res?.hosts) setHosts(res.hosts);
      } catch {
        // ignore
      }
    })();
  }, []);

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
  setLoading(true);

  try {
    const formPayload = new FormData();

    formPayload.append("eventName", formData.eventName);
    formPayload.append("hostedBy", formData.hostedBy);
    formPayload.append("subtitle", formData.subtitle);
    formPayload.append("category", formData.category);

    if (formData.eventImage) {
      formPayload.append("eventImage", formData.eventImage);
    } else if (editingEvent && formData.existingEventImage) {
      formPayload.append("existingImageUrl", formData.existingEventImage);
    }

    formPayload.append("date", formData.date);
    formPayload.append("time", formData.time);
    formPayload.append("fullAddress", formData.fullAddress);
    formPayload.append("city", formData.city);

    formPayload.append("about", formData.about);
    formPayload.append("partyFlow", formData.partyFlow);
    formPayload.append("whatsIncluded", formData.whatsIncluded);
    formPayload.append("howItWorks", formData.howItWorks);
    formPayload.append(
      "whatsIncludedInTicket",
      formData.whatsIncludedInTicket
    );

    formPayload.append("passes", JSON.stringify(formData.passes));

    if (formData.hostId) {
      formPayload.append("hostId", formData.hostId);
    }

    formPayload.append("ageRestriction", formData.ageRestriction);
    formPayload.append("maxCapacity", String(formData.maxCapacity));
    formPayload.append("expectedGuestCount", formData.expectedGuestCount);
    formPayload.append("maleToFemaleRatio", formData.maleToFemaleRatio);
    formPayload.append("thingsToKnow", formData.thingsToKnow);
    formPayload.append("partyEtiquette", formData.partyEtiquette);
    formPayload.append("houseRules", formData.houseRules);
    formPayload.append("partyTerms", formData.partyTerms);
    formPayload.append("cancellationPolicy", formData.cancellationPolicy);

    // ✅ INTERNAL NEXT.JS API ROUTES ONLY
const endpoint = editingEvent
      ? `/api/admin/event/update-event/${editingEvent._id}`
      : `/api/admin/event/create-event`;

    const method = editingEvent ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      body: formPayload,
      credentials: "include", // still required
    });

    const contentType = res.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(
        `Server returned non-JSON response: ${res.status} ${res.statusText}`
      );
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }

    toast.success(
      editingEvent
        ? "Event updated successfully!"
        : "Event created successfully!"
    );

    editingEvent ? onEventUpdated?.() : onEventCreated?.();
    onClose();
    setFormData(initialFormState);
    setStep(1);
  } catch (err: unknown) {
    const error =
      err instanceof Error ? err : new Error("Something went wrong");
    console.error("Submit error:", error);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 5 — {steps[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <StepBasics
            formData={formData}
            updateFormData={updateFormData}
            hosts={hosts}
          />
        )}
        {step === 2 && (
          <StepSchedule
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {step === 3 && (
          <StepDescription
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {step === 4 && (
          <StepPasses
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {step === 5 && (
          <StepRules
            formData={formData}
            updateFormData={updateFormData}
          />
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={step === 1 ? onClose : back}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button onClick={step === 5 ? handleSubmit : next} disabled={loading}>
            {step === 5
              ? editingEvent
                ? "Update Event"
                : "Create Event"
              : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}