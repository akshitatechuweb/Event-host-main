"use client"

import { useState, useEffect } from "react"
import { createPass, getAllEvents } from "@/lib/admin"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTicketModalProps {
  open: boolean
  onClose: () => void
}

export default function AddTicketModal({ open, onClose }: AddTicketModalProps) {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  
  const [formData, setFormData] = useState({
    type: "",
    price: "",
    totalQuantity: ""
  })

  useEffect(() => {
    if (open) {
      loadEvents()
    }
  }, [open])

  async function loadEvents() {
    try {
      const res = await getAllEvents()
      if (res && res.success && Array.isArray(res.events)) {
        setEvents(res.events)
      }
    } catch (err) {
      console.error("Failed to load events", err)
    }
  }

  const handleSubmit = async () => {
    if (!selectedEventId || !formData.type || !formData.price || !formData.totalQuantity) {
      alert("Please fill all fields")
      return
    }

    try {
      setLoading(true)
      await createPass(selectedEventId, {
        type: formData.type,
        price: Number(formData.price),
        totalQuantity: Number(formData.totalQuantity)
      })
      
      alert("Ticket created successfully!") // In a real app use toast
      onClose()
      window.location.reload() // Refresh to show new ticket
    } catch (error: any) {
      alert(error.message || "Failed to create ticket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Ticket</DialogTitle>
          <DialogDescription>Create a new ticket pass for a specific event.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* Event Selector */}
          <div className="space-y-2">
            <Label>Select Event *</Label>
            <Select onValueChange={setSelectedEventId} value={selectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev._id} value={ev._id}>
                    {ev.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pass Type *</Label>
            <Select 
              onValueChange={(val) => setFormData({...formData, type: val})}
              value={formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pass type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Couple">Couple</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price *</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Total Quantity *</Label>
              <Input 
                type="number" 
                placeholder="100"
                value={formData.totalQuantity}
                onChange={(e) => setFormData({...formData, totalQuantity: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Add Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
