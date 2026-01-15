export function HostTableHeader() {
  return (
    <div className="
      grid grid-cols-8 gap-4 px-6 py-4
      bg-muted/50 border-b border-border
      text-xs uppercase tracking-wider text-muted-foreground
    ">
      <div>User</div>
      <div>City</div>
      <div>Locality</div>
      <div>Pincode</div>
      <div>Preferred Date</div>
      <div>Status</div>
      <div className="text-center">Actions</div>
    </div>
  );
}
