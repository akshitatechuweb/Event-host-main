import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StepSchedule() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Date *">
        <Input type="date" />
      </Field>

      <Field label="Time *">
        <Input type="time" />
      </Field>

      <Field label="Entry Fees *">
        <Input type="number" placeholder="599" min={0} />
      </Field>

      <div className="md:col-span-2">
        <Field label="Full Address *">
          <Input placeholder="Canvas Laugh Club, DLF Cyber Hub, Gurgaon" />
        </Field>
      </div>

      <Field label="City *">
        <Input placeholder="Gurgaon" />
      </Field>
    </div>
  )
}

function Field({ label, children }: any) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
