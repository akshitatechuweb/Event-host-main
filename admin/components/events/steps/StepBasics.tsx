import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { EventFormData } from "@/components/events/AddEventModal";

interface StepBasicsProps {
  formData: EventFormData;
  updateFormData: (data: Partial<EventFormData>) => void;
  hosts?: Array<{ hostId: string; name: string; email?: string; city?: string }>;
}

export function StepBasics({ formData, updateFormData, hosts }: StepBasicsProps) {
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>(
    formData.category ? formData.category.split(",") : []
  );

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCategories();
    }
  };

  const handleCategoryBlur = () => addCategories();

  const addCategories = () => {
    if (!categoryInput.trim()) return;

    const newCategories = categoryInput
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c && !categories.includes(c));

    if (newCategories.length) {
      const updated = [...categories, ...newCategories];
      setCategories(updated);
      updateFormData({ category: updated.join(",") });
      setCategoryInput("");
    }
  };

  const removeCategory = (category: string) => {
    const updated = categories.filter((c) => c !== category);
    setCategories(updated);
    updateFormData({ category: updated.join(",") });
  };

  return (
    <div className="space-y-6">
      {/* Event Name */}
      <Field label="Event Name *">
        <Input
          placeholder="Summer Music Festival"
          value={formData.eventName}
          onChange={(e) => updateFormData({ eventName: e.target.value })}
        />
      </Field>

      {/* Assign Host */}
      <Field label="Assign Host">
        <div className="relative">
          <select
            value={formData.hostId ?? ""}
            onChange={(e) => {
              const id = e.target.value || null;
              updateFormData({ hostId: id });

              const selected = (hosts || []).find((h) => h.hostId === id);
              if (selected) updateFormData({ hostedBy: selected.name });
            }}
            className="
              h-11 w-full rounded-xl px-4 pr-10 text-sm
              bg-white text-black border border-black/10
              focus:outline-none focus:ring-2 focus:ring-violet-500

              dark:bg-[#14101d] dark:text-white dark:border-white/10
              dark:focus:ring-violet-400

              appearance-none
            "
          >
            <option
              value=""
              className="bg-white text-black dark:bg-[#14101d] dark:text-white"
            >
              (Select a host – optional)
            </option>

            {(hosts || []).map((h) => (
              <option
                key={h.hostId}
                value={h.hostId}
                className="bg-white text-black dark:bg-[#14101d] dark:text-white"
              >
                {h.name} {h.city ? `— ${h.city}` : ""}
              </option>
            ))}
          </select>

          {/* Custom Arrow */}
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4
                       text-black/50 dark:text-white/50"
          />
        </div>
      </Field>

      {/* Hosted By */}
      <Field label="Hosted By *">
        <Input
          placeholder="John Doe"
          value={formData.hostedBy}
          onChange={(e) => updateFormData({ hostedBy: e.target.value })}
        />
      </Field>

      {/* Subtitle */}
      <Field label="Subtitle">
        <Input
          placeholder="A night of music & vibes"
          value={formData.subtitle}
          onChange={(e) => updateFormData({ subtitle: e.target.value })}
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
                  variant="secondary"
                  className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="ml-2 hover:text-red-500 transition"
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
            onKeyDown={handleCategoryKeyDown}
            onBlur={handleCategoryBlur}
            placeholder="Type categories (comma or Enter)"
            className="h-11 bg-white dark:bg-black/20 border-black/10 dark:border-white/10 focus:border-violet-500"
          />

          <p className="text-xs text-black/50 dark:text-white/50">
            Example: Festival, Music, Party
          </p>
        </div>
      </Field>

      {/* Event Image */}
      <Field label="Event Image">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            updateFormData({ eventImage: e.target.files?.[0] || null })
          }
          className="
            h-11 bg-white dark:bg-black/20 border-black/10 dark:border-white/10
            file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2
            file:bg-violet-500/10 file:text-violet-700 dark:file:text-violet-300
            hover:file:bg-violet-500/20
          "
        />
        {/* Minimal preview for existing image when editing; no layout change */}
        {formData.existingEventImage && !formData.eventImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
            <img
              src={formData.existingEventImage}
              alt={formData.eventName || "Event image"}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-black dark:text-white">
        {label}
      </Label>
      {children}
    </div>
  );
}