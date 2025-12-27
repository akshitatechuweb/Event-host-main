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

// Import your separate step components
import { StepBasics } from "../events/steps/StepBasics";      
import { StepSchedule } from "../events/steps/StepSchedule";       
import { StepDescription } from "../events/steps/StepDescription"; 
import { StepPasses } from "../events/steps/StepPasses";
import { StepRules } from "../events/steps/StepRules";             

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  "Event identity",
  "Time & location",
  "Descriptions",
  "Passes & pricing",
  "Limits & policies",
];

export default function AddEventModal({ open, onClose }: AddEventModalProps) {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          w-[92vw] max-w-[520px] sm:max-w-[640px]
          rounded-3xl overflow-y-auto max-h-[90vh]
          backdrop-blur-2xl
          bg-white
          dark:bg-gradient-to-b dark:from-[#15121c]/95 dark:to-[#0e0b14]/95
          border border-black/5 dark:border-white/5
          shadow-[0_24px_80px_rgba(0,0,0,0.25)]
          dark:shadow-[0_40px_120px_rgba(0,0,0,0.6)]
        "
      >
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

        {/* Dynamic Content based on step */}
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 1 && <StepBasics />}
          {step === 2 && <StepSchedule />}
          {step === 3 && <StepDescription />}
          {step === 4 && <StepPasses />}
          {step === 5 && <StepRules />}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : back}
            className="text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={step === 5 ? onClose : next}
            className="
              h-11 px-6 rounded-xl
              bg-violet-600 text-white
              hover:bg-violet-500
              shadow-[0_6px_18px_rgba(124,58,237,0.25)]
              transition-all
            "
          >
            {step === 5 ? "Create Event" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}