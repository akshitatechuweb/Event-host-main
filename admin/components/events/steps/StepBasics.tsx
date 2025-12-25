import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StepBasics() {
  return (
    <div className="space-y-6">
      <Field label="Event Name *">
        <Input placeholder="Summer Music Festival" />
      </Field>

      <Field label="Hosted By *">
        <Input placeholder="John Doe" />
      </Field>

      <Field label="Subtitle">
        <Input placeholder="A night of music & vibes" />
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
