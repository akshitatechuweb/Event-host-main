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

      <Field label="Address *">
        <Input placeholder="123 Main Street" />
      </Field>

      <Field label="City *">
        <Input placeholder="New York" />
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
