"use client";
import { useState } from "react";
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

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

export interface EventFormData {
  // Step 1: Basics
  eventName: string;
  hostedBy: string;
  subtitle: string;
  category: string;
  eventImage: File | null;

  // Step 2: Schedule
  date: string;
  time: string;
  fullAddress: string;
  city: string;

  // Step 3: Description
  about: string;
  partyFlow: string;
  whatsIncluded: string;
  howItWorks: string;
  whatsIncludedInTicket: string;

  // Step 4: Passes
  passes: Array<{
    type: "Male" | "Female" | "Couple";
    price: number;
    totalQuantity: number;
  }>;

  // Step 5: Rules
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

export default function AddEventModal({ open, onClose, onEventCreated }: AddEventModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    hostedBy: "",
    subtitle: "",
    category: "",
    eventImage: null,
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
  });

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formPayload = new FormData();

      // Basic fields
      formPayload.append("eventName", formData.eventName);
      formPayload.append("hostedBy", formData.hostedBy);
      formPayload.append("subtitle", formData.subtitle);
      formPayload.append("category", formData.category);
      
      if (formData.eventImage) {
        formPayload.append("eventImage", formData.eventImage);
      }

      // Schedule
      formPayload.append("date", formData.date);
      formPayload.append("time", formData.time);
      formPayload.append("fullAddress", formData.fullAddress);
      formPayload.append("city", formData.city);

      // Description
      formPayload.append("about", formData.about);
      formPayload.append("partyFlow", formData.partyFlow);
      formPayload.append("whatsIncluded", formData.whatsIncluded);
      formPayload.append("howItWorks", formData.howItWorks);
      formPayload.append("whatsIncludedInTicket", formData.whatsIncludedInTicket);

      // Passes - IMPORTANT: Send as JSON string
      const passesWithRemainingQty = formData.passes.map(pass => ({
        type: pass.type,
        price: pass.price,
        totalQuantity: pass.totalQuantity,
        remainingQuantity: pass.totalQuantity
      }));
      formPayload.append("passes", JSON.stringify(passesWithRemainingQty));

      // Rules
      formPayload.append("ageRestriction", formData.ageRestriction);
      formPayload.append("maxCapacity", formData.maxCapacity.toString());
      formPayload.append("expectedGuestCount", formData.expectedGuestCount);
      formPayload.append("maleToFemaleRatio", formData.maleToFemaleRatio);
      formPayload.append("thingsToKnow", formData.thingsToKnow);
      formPayload.append("partyEtiquette", formData.partyEtiquette);
      formPayload.append("houseRules", formData.houseRules);
      formPayload.append("partyTerms", formData.partyTerms);
      formPayload.append("cancellationPolicy", formData.cancellationPolicy);

      const response = await fetch("/api/events", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create event");
      }

      toast.success("Event created successfully");

      onEventCreated?.();
      onClose();
      
      // Reset form
      setStep(1);
      setFormData({
        eventName: "",
        hostedBy: "",
        subtitle: "",
        category: "",
        eventImage: null,
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
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[92vw] max-w-[520px] sm:max-w-[640px] rounded-3xl overflow-y-auto max-h-[90vh] backdrop-blur-2xl bg-white dark:bg-gradient-to-b dark:from-[#15121c]/95 dark:to-[#0e0b14]/95 border border-black/5 dark:border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold text-black dark:text-white">
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-sm text-black/50 dark:text-white/50">
            Step {step} of 5 — {steps[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "bg-violet-500" : "bg-black/10 dark:bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="mt-6">
          {step === 1 && <StepBasics formData={formData} updateFormData={updateFormData} />}
          {step === 2 && <StepSchedule formData={formData} updateFormData={updateFormData} />}
          {step === 3 && <StepDescription formData={formData} updateFormData={updateFormData} />}
          {step === 4 && <StepPasses formData={formData} updateFormData={updateFormData} />}
          {step === 5 && <StepRules formData={formData} updateFormData={updateFormData} />}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : back}
            disabled={loading}
            className="text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={step === 5 ? handleSubmit : next}
            disabled={loading}
            className="h-11 px-6 rounded-xl bg-violet-600 text-white hover:bg-violet-500 shadow-[0_6px_18px_rgba(124,58,237,0.25)] transition-all"
          >
            {loading ? "Creating..." : step === 5 ? "Create Event" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}