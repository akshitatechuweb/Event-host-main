"use client";

export function HostTableHeader() {
  return (
    <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-muted/30 border-b border-border">
      <div className="text-xs font-medium text-muted-foreground uppercase">
        User
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase">
        City
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase">
        Preferred Date
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase">
        Status
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase">
        Actions
      </div>
    </div>
  );
}
