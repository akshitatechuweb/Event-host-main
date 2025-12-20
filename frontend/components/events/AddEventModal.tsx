"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddEventModal({ open, onClose }: AddEventModalProps) {
  // You can add form handling (react-hook-form + zod) later
  const handleSubmit = () => {
    // TODO: API call to create event
    console.log("Create event submitted");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in all the required details to create your event.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input id="eventName" placeholder="e.g. Summer Music Festival" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostedBy">Hosted By *</Label>
              <Input id="hostedBy" placeholder="e.g. John Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle (optional)</Label>
            <Input id="subtitle" placeholder="A catchy tagline" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day (optional)</Label>
              <Input id="day" placeholder="Friday" />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullAddress">Full Address *</Label>
              <Input id="fullAddress" placeholder="123 Main Street" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="New York" />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="eventImage">Event Image URL (optional)</Label>
            <Input id="eventImage" placeholder="https://example.com/image.jpg" />
          </div>

          {/* Descriptions */}
          <div className="space-y-2">
            <Label htmlFor="about">About the Event</Label>
            <Textarea id="about" rows={5} placeholder="Describe your event..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partyFlow">Party Flow</Label>
              <Textarea id="partyFlow" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partyEtiquette">Party Etiquette</Label>
              <Textarea id="partyEtiquette" rows={3} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsIncluded">Whats Included</Label>
              <Textarea id="whatsIncluded" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseRules">House Rules</Label>
              <Textarea id="houseRules" rows={3} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="howItWorks">How It Works</Label>
              <Textarea id="howItWorks" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <Textarea id="cancellationPolicy" rows={3} />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageRestriction">Age Restriction</Label>
              <Input id="ageRestriction" placeholder="21+" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Music, Party, Conference..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Max Capacity</Label>
            <Input id="maxCapacity" type="number" placeholder="500" />
          </div>

          {/* More optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedGuestCount">Expected Guests</Label>
              <Input id="expectedGuestCount" placeholder="400-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maleToFemaleRatio">Male:Female Ratio</Label>
              <Input id="maleToFemaleRatio" placeholder="50:50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thingsToKnow">Things to Know</Label>
            <Textarea id="thingsToKnow" rows={3} />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}