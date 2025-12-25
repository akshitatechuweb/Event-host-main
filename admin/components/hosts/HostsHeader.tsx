export function HostsHeader() {
  return (
    <header className="relative space-y-3">
      {/* subtle background glow */}
      <div className="absolute -top-32 -left-24 w-80 h-80 bg-pink-400/20 blur-[140px] rounded-full -z-10" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-400/20 blur-[160px] rounded-full -z-10" />

      <h1 className="
        text-[3rem] font-semibold tracking-tight
        bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500
        bg-clip-text text-transparent
      ">
        Hosts
      </h1>

      <p className="flex items-center gap-4 text-muted-foreground">
        <span className="h-px w-8 bg-gradient-to-r from-pink-400 to-violet-400" />
        Manage host requests & approvals
      </p>
    </header>
  )
}
