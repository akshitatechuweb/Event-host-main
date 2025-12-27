import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventFormData } from "@/components/events/AddEventModal";

interface StepScheduleProps {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
}

export function StepSchedule({ formData, updateFormData }: StepScheduleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Date *">
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => updateFormData({ date: e.target.value })}
        />
      </Field>

      <Field label="Time *">
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => updateFormData({ time: e.target.value })}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Full Address *">
          <Input
            placeholder="Canvas Laugh Club, DLF Cyber Hub, Gurgaon"
            value={formData.fullAddress}
            onChange={(e) => updateFormData({ fullAddress: e.target.value })}
          />
        </Field>
      </div>

      <Field label="City *">
        <Input
          placeholder="Gurgaon"
          value={formData.city}
          onChange={(e) => updateFormData({ city: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}