import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function StepDescription() {
  return (
    <div className="space-y-6">
      <Field label="About the Event">
        <Textarea rows={4} />
      </Field>

      <Field label="Party Flow">
        <Textarea rows={3} />
      </Field>

      <Field label="What’s Included">
        <Textarea rows={3} />
      </Field>

      <Field label="How It Works">
        <Textarea rows={3} />
      </Field>

      <Field label="What’s Included In Ticket">
        <Textarea rows={2} />
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
