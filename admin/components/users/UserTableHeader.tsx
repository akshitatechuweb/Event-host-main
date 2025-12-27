// components/users/UserTableHeader.tsx
"use client";

export function UserTableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-muted/30 border-b border-border">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Name
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Email
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Phone Number
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        City
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Status
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Actions
      </div>
    </div>
  );
}