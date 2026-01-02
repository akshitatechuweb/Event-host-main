import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EventFormData } from "@/components/events/AddEventModal"
import type { ReactNode } from "react"

interface StepDescriptionProps {
  formData: EventFormData
  updateFormData: (data: Partial<EventFormData>) => void
}

export function StepDescription({
  formData,
  updateFormData,
}: StepDescriptionProps) {
  return (
    <div className="space-y-6">
      <Field label="About the Event">
        <Textarea
          rows={4}
          value={formData.about ?? ""}
          onChange={(e) =>
            updateFormData({ about: e.target.value })
          }
        />
      </Field>

      <Field label="Party Flow">
        <Textarea
          rows={3}
          value={formData.partyFlow ?? ""}
          onChange={(e) =>
            updateFormData({ partyFlow: e.target.value })
          }
        />
      </Field>

      <Field label="What's Included">
        <Textarea
          rows={3}
          value={formData.whatsIncluded ?? ""}
          onChange={(e) =>
            updateFormData({ whatsIncluded: e.target.value })
          }
        />
      </Field>

      <Field label="How It Works">
        <Textarea
          rows={3}
          value={formData.howItWorks ?? ""}
          onChange={(e) =>
            updateFormData({ howItWorks: e.target.value })
          }
        />
      </Field>

      <Field label="What's Included In Ticket">
        <Textarea
          rows={2}
          value={formData.whatsIncludedInTicket ?? ""}
          onChange={(e) =>
            updateFormData({
              whatsIncludedInTicket: e.target.value,
            })
          }
        />
      </Field>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
