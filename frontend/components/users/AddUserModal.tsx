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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddUserModal({ open, onClose }: AddUserModalProps) {
  const handleSubmit = () => {
    console.log("User saved (static)");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Create or update a user profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Full name" />
            </div>

            <div>
              <Label>Phone *</Label>
              <Input placeholder="9999999999" />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="user@email.com" />
            </div>

            <div>
              <Label>City</Label>
              <Input placeholder="Delhi" />
            </div>

            <div>
              <Label>Gender</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PROFILE INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bio</Label>
              <Textarea rows={3} />
            </div>
            <div>
              <Label>Fun Fact</Label>
              <Textarea rows={3} />
            </div>
          </div>

          <div>
            <Label>Interests (comma separated)</Label>
            <Input placeholder="Music, Travel, Tech" />
          </div>

          {/* PHOTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Profile Photo URL</Label>
              <Input placeholder="https://..." />
            </div>
            <div>
              <Label>Other Photo URL</Label>
              <Input placeholder="https://..." />
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Aadhaar URL</Label>
              <Input />
            </div>
            <div>
              <Label>PAN URL</Label>
              <Input />
            </div>
            <div>
              <Label>Driving License URL</Label>
              <Input />
            </div>
          </div>

          {/* ROLE & STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
