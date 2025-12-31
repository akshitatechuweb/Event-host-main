"use client";

import { Progress } from "@/components/ui/progress";

interface Pass {
  ticketType: string;
  price: number;
  total: number;
  sold: number;
  available: number;
}

export function TicketBreakdownTable({ passes }: { passes: Pass[] }) {
  return (
    <div className="mt-2 border border-border/40 rounded-lg overflow-hidden bg-background/30">
      <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-muted/10 border-b border-border/30 text-xs font-normal uppercase tracking-wider text-muted-foreground">
        <div>Pass</div>
        <div>Price</div>
        <div>Sold</div>
        <div>Total</div>
        <div>Available</div>
        <div>Progress</div>
        <div>Status</div>
      </div>

      {passes.map((p, i) => {
        const percent = p.total > 0 ? Math.round((p.sold / p.total) * 100) : 0;
        const status =
          p.available === 0
            ? "Sold Out"
            : percent >= 80
            ? "Almost Full"
            : "Selling";

        const statusColor =
          status === "Sold Out"
            ? "bg-red-500/10 text-red-600"
            : status === "Almost Full"
            ? "bg-amber-500/10 text-amber-600"
            : "bg-green-500/10 text-green-600";

        return (
          <div
            key={i}
            className="grid grid-cols-7 gap-4 px-4 py-3.5 border-t border-border/30 text-sm hover:bg-muted/8 transition-colors duration-150"
          >
            <div className="font-medium text-foreground">{p.ticketType}</div>
            <div className="text-muted-foreground">
              ₹{p.price.toLocaleString("en-IN")}
            </div>
            <div className="font-medium text-foreground">{p.sold}</div>
            <div className="text-muted-foreground">{p.total}</div>
            <div className="text-muted-foreground">{p.available}</div>
            <div className="flex items-center">
              <div className="w-full">
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        background:
                          percent >= 80
                            ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                            : "linear-gradient(to right, #22c55e, #4ade80)",
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground/60 mt-1.5">
                  {percent}%
                </div>
              </div>
            </div>
            <div className="flex">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}
              >
                {status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
