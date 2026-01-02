"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, ChevronDown } from "lucide-react"
import { EventFormData } from "@/components/events/AddEventModal"

interface Host {
  hostId: string
  name: string
  email?: string
  city?: string
}

interface StepBasicsProps {
  formData: EventFormData
  updateFormData: (data: Partial<EventFormData>) => void
  hosts?: Host[]
}

export function StepBasics({
  formData,
  updateFormData,
  hosts,
}: StepBasicsProps) {
  const [categoryInput, setCategoryInput] = useState<string>("")
  const [categories, setCategories] = useState<string[]>(
    formData.category ? formData.category.split(",") : []
  )

  const addCategories = () => {
    if (!categoryInput.trim()) return

    const newCategories = categoryInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c && !categories.includes(c))

    if (newCategories.length > 0) {
      const updated = [...categories, ...newCategories]
      setCategories(updated)
      updateFormData({ category: updated.join(",") })
      setCategoryInput("")
    }
  }

  const removeCategory = (category: string) => {
    const updated = categories.filter((c) => c !== category)
    setCategories(updated)
    updateFormData({ category: updated.join(",") })
  }

  return (
    <div className="space-y-6">
      {/* Event Name */}
      <Field label="Event Name *">
        <Input
          placeholder="Summer Music Festival"
          value={formData.eventName}
          onChange={(e) =>
            updateFormData({ eventName: e.target.value })
          }
        />
      </Field>

      {/* Assign Host */}
      <Field label="Assign Host">
        <div className="relative">
          <select
            value={formData.hostId ?? ""}
            onChange={(e) => {
              const id = e.target.value || null
              updateFormData({ hostId: id })

              if (id) {
                const selected = hosts?.find((h) => h.hostId === id)
                if (selected) {
                  updateFormData({ hostedBy: selected.name })
                }
              }
            }}
            className="
              h-11 w-full rounded-xl px-4 pr-10 text-sm
              bg-white text-black border border-black/10
              focus:outline-none focus:ring-2 focus:ring-violet-500
              dark:bg-[#14101d] dark:text-white dark:border-white/10
              appearance-none
            "
          >
            <option value="">(Select a host – optional)</option>
            {hosts?.map((h) => (
              <option key={h.hostId} value={h.hostId}>
                {h.name} {h.city ? `— ${h.city}` : ""}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50 dark:text-white/50" />
        </div>
      </Field>

      {/* Hosted By */}
      <Field label="Hosted By *">
        <Input
          placeholder="John Doe"
          value={formData.hostedBy}
          onChange={(e) =>
            updateFormData({ hostedBy: e.target.value })
          }
        />
      </Field>

      {/* Subtitle */}
      <Field label="Subtitle">
        <Input
          placeholder="A night of music & vibes"
          value={formData.subtitle}
          onChange={(e) =>
            updateFormData({ subtitle: e.target.value })
          }
        />
      </Field>

      {/* Categories */}
      <Field label="Categories">
        <div className="space-y-3">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onBlur={addCategories}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                addCategories()
              }
            }}
            placeholder="Type categories (comma or Enter)"
          />
        </div>
      </Field>

      {/* Existing Image Preview */}
      {formData.existingEventImage && !formData.eventImage && (
        <Field label="Current Event Image">
          <div className="relative">
            <img
              src={formData.existingEventImage}
              alt="Current event"
              className="h-40 w-full rounded-xl object-cover border border-black/10 dark:border-white/10"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              This image will be kept unless you upload a new one.
            </p>
          </div>
        </Field>
      )}

      {/* Upload New Image */}
      <Field label="Event Image">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null
            updateFormData({
              eventImage: file,
              existingEventImage: file
                ? null
                : formData.existingEventImage,
            })
          }}
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
      <Label className="text-sm font-medium text-black dark:text-white">
        {label}
      </Label>
      {children}
    </div>
  )
}
