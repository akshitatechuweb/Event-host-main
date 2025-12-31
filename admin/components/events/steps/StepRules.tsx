import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EventFormData } from "@/components/events/AddEventModal";

interface StepRulesProps {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
}

export function StepRules({ formData, updateFormData }: StepRulesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Age Restriction">
        <Input
          placeholder="21+"
          value={formData.ageRestriction}
          onChange={(e) => updateFormData({ ageRestriction: e.target.value })}
        />
      </Field>

      <Field label="Max Capacity">
        <Input
          type="number"
          placeholder="500"
          value={formData.maxCapacity || ""}
          onChange={(e) =>
            updateFormData({ maxCapacity: Number(e.target.value) })
          }
        />
      </Field>

      <Field label="Expected Guest Count">
        <Input
          placeholder="150+"
          value={formData.expectedGuestCount}
          onChange={(e) =>
            updateFormData({ expectedGuestCount: e.target.value })
          }
        />
      </Field>

      <Field label="Male to Female Ratio">
        <Input
          placeholder="60:40"
          value={formData.maleToFemaleRatio}
          onChange={(e) =>
            updateFormData({ maleToFemaleRatio: e.target.value })
          }
        />
      </Field>

      <Field label="Things To Know">
        <Input
          placeholder="Carry ID proof"
          value={formData.thingsToKnow}
          onChange={(e) => updateFormData({ thingsToKnow: e.target.value })}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Party Etiquette">
          <Textarea
            rows={3}
            value={formData.partyEtiquette}
            onChange={(e) =>
              updateFormData({ partyEtiquette: e.target.value })
            }
          />
        </Field>
      </div>

      <Field label="House Rules">
        <Textarea
          rows={3}
          value={formData.houseRules}
          onChange={(e) => updateFormData({ houseRules: e.target.value })}
        />
      </Field>

      <Field label="Party Terms">
        <Textarea
          rows={3}
          value={formData.partyTerms}
          onChange={(e) => updateFormData({ partyTerms: e.target.value })}
        />
      </Field>

      <div className="md:col-span-2">
        <Field label="Cancellation Policy">
          <Textarea
            rows={3}
            value={formData.cancellationPolicy}
            onChange={(e) =>
              updateFormData({ cancellationPolicy: e.target.value })
            }
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}