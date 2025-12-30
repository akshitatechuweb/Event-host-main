"use client"

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
  const handleSubmit = () => {
    // static for now
    console.log("Ticket created (static)")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Ticket</DialogTitle>
          <DialogDescription>Create a new ticket pass for this event.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label>Pass Type *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select pass type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Couple">Couple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Price *</Label>
            <Input type="number" placeholder="e.g. 999" />
          </div>

          <div className="space-y-2">
            <Label>Total Quantity *</Label>
            <Input type="number" placeholder="e.g. 100" />
          </div>

          <div className="space-y-2">
            <Label>Remaining Quantity</Label>
            <Input type="number" placeholder="Auto calculated" disabled />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
