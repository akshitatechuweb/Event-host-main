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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  "Event identity",
  "Time & location",
  "Descriptions",
  "Limits & policies",
];

export default function AddEventModal({ open, onClose }: AddEventModalProps) {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          w-[92vw] max-w-[520px]
          rounded-3xl overflow-hidden
          backdrop-blur-2xl
          bg-white
          dark:bg-gradient-to-b dark:from-[#15121c]/95 dark:to-[#0e0b14]/95
          border border-black/5 dark:border-white/5
          shadow-[0_24px_80px_rgba(0,0,0,0.25)]
          dark:shadow-[0_40px_120px_rgba(0,0,0,0.6)]
        "
      >
        {/* HEADER */}
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold text-black dark:text-white">
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-sm text-black/50 dark:text-white/50">
            Step {step} of 4 — {steps[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* STEPPER */}
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`
                h-1 flex-1 rounded-full transition-all
                ${
                  i <= step
                    ? "bg-violet-500"
                    : "bg-black/10 dark:bg-white/10"
                }
              `}
            />
          ))}
        </div>

        {/* CONTENT */}
        <div
          key={step}
          className="mt-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {step === 1 && (
            <>
              <Input className={inputClass} placeholder="Event name" />
              <Input className={inputClass} placeholder="Hosted by" />
              <Input className={inputClass} placeholder="Subtitle (optional)" />
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input className={inputClass} type="date" />
                <Input className={inputClass} type="time" />
              </div>
              <Input className={inputClass} placeholder="Address" />
              <Input className={inputClass} placeholder="City" />
            </>
          )}

          {step === 3 && (
            <>
              <Textarea
                className={textareaClass}
                rows={4}
                placeholder="About the event"
              />
              <Textarea
                className={textareaClass}
                rows={3}
                placeholder="Party flow"
              />
              <Textarea
                className={textareaClass}
                rows={3}
                placeholder="What’s included"
              />
            </>
          )}

          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input className={inputClass} placeholder="Age restriction" />
                <Input className={inputClass} placeholder="Max capacity" />
              </div>
              <Input className={inputClass} placeholder="Category" />
              <Textarea
                className={textareaClass}
                rows={3}
                placeholder="Cancellation policy"
              />
            </>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : back}
            className="text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            onClick={step === 4 ? onClose : next}
            className="
              h-11 px-6 rounded-xl
              bg-violet-600 text-white
              hover:bg-violet-500
              shadow-[0_6px_18px_rgba(124,58,237,0.25)]
              transition-all
            "
          >
            {step === 4 ? "Create Event" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- STYLES ---------- */

const inputClass =
  "h-11 rounded-xl px-4 text-sm outline-none transition " +
  "bg-black/5 text-black placeholder:text-black/40 border border-black/10 " +
  "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 " +
  "dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:border-white/10";

const textareaClass =
  "rounded-xl px-4 py-3 text-sm outline-none transition " +
  "bg-black/5 text-black placeholder:text-black/40 border border-black/10 " +
  "focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20 " +
  "dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:border-white/10";
