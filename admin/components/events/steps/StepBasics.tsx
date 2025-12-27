import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { X } from "lucide-react"

export function StepBasics() {
  const [categoryInput, setCategoryInput] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addCategories()
    }
  }

  const handleCategoryBlur = () => {
    addCategories()
  }

  const addCategories = () => {
    if (!categoryInput.trim()) return

    // Split by comma and clean up each category
    const newCategories = categoryInput
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0 && !categories.includes(cat))

    if (newCategories.length > 0) {
      setCategories([...categories, ...newCategories])
      setCategoryInput("")
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove))
  }

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

      {/* Gender Preference */}
      <Field label="Gender Preference">
        <Select defaultValue="both">
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Both</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* Free Text Category Input */}
      <Field label="Categories">
        <div className="space-y-3">
          {/* Display Selected Categories as Tags */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="
                    px-3 py-1.5 text-sm rounded-lg
                    bg-violet-500/10 text-violet-700 dark:text-violet-300
                    border border-violet-500/20
                    hover:bg-violet-500/20
                    transition-colors
                  "
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Input for Adding Categories */}
          <Input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={handleCategoryKeyDown}
            onBlur={handleCategoryBlur}
            placeholder="Type categories (separate with commas or press Enter)"
            className="
              h-11 bg-white dark:bg-black/20
              border-black/10 dark:border-white/10
              focus:border-violet-500 dark:focus:border-violet-500
            "
          />
          <p className="text-xs text-black/50 dark:text-white/50">
            Type "Festival, Music, Party" or press Enter after each category
          </p>
        </div>
      </Field>

      <Field label="Event Image">
        <Input
          type="file"
          accept="image/*"
          className="
            h-11 bg-white dark:bg-black/20
            border-black/10 dark:border-white/10
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-violet-500/10 file:text-violet-700
            dark:file:text-violet-300
            hover:file:bg-violet-500/20
          "
        />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-black dark:text-white">
        {label}
      </Label>
      {children}
    </div>
  )
}