import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function StepRules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Age Restriction">
        <Input placeholder="21+" />
      </Field>

      <Field label="Max Capacity">
        <Input type="number" placeholder="500" />
      </Field>

      <Field label="Category">
        <Input placeholder="Music / Party" />
      </Field>

      <Field label="Cancellation Policy">
        <Textarea rows={3} />
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
