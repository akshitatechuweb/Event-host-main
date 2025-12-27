import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function StepRules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Age Restriction">
        <Input placeholder="21+" />
      </Field>

      <Field label="Gender Preference">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Both" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Both</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Max Capacity">
        <Input type="number" placeholder="500" />
      </Field>

      <Field label="Expected Guest Count">
        <Input placeholder="150+" />
      </Field>

      <Field label="Male to Female Ratio">
        <Input placeholder="60:40" />
      </Field>

      <Field label="Things To Know">
        <Input placeholder="Carry ID proof" />
      </Field>

      <Field label="Party Etiquette">
        <Textarea rows={3} />
      </Field>

      <Field label="House Rules">
        <Textarea rows={3} />
      </Field>

      <Field label="Party Terms">
        <Textarea rows={3} />
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
