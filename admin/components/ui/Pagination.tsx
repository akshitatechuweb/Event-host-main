"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const safeTotalItems = totalItems || 0;
  const safeLimit = limit || 10;
  const safeCurrentPage = currentPage || 1;
  const safeTotalPages = totalPages || 1;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > safeTotalPages || page === safeCurrentPage) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", newLimit.toString());
      params.set("page", "1"); // Reset to page 1 when limit changes
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const startRange =
    safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safeLimit + 1;
  const endRange = Math.min(safeCurrentPage * safeLimit, safeTotalItems);

  const renderPageNumbers = () => {
    if (safeTotalPages <= 1) return null;
    const pages = [];
    const showMax = 5;

    let startPage = Math.max(1, safeCurrentPage - Math.floor(showMax / 2));
    let endPage = Math.min(safeTotalPages, startPage + showMax - 1);

    if (endPage - startPage + 1 < showMax) {
      startPage = Math.max(1, endPage - showMax + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={cn(
            "min-w-[40px] h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-300",
            i === safeCurrentPage
              ? "bg-linear-to-br from-sidebar-primary to-violet-600 text-white shadow-lg shadow-sidebar-primary/25 scale-110"
              : "hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-sidebar-border/50"
          )}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-8",
        className
      )}
    >
      <div className="flex items-center gap-4 order-2 sm:order-1">
        <div className="text-sm font-bold tracking-tight text-muted-foreground/50">
          <span className="text-foreground text-base">{startRange}</span>
          <span className="mx-1.5">—</span>
          <span className="text-foreground text-base">{endRange}</span>
          <span className="mx-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/30">
            of
          </span>
          <span className="text-foreground text-base">{safeTotalItems}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 order-1 sm:order-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={safeCurrentPage === 1 || safeTotalPages <= 1}
            className="p-3 rounded-xl border border-sidebar-border/50 bg-card hover:bg-muted disabled:opacity-20 disabled:pointer-events-none transition-smooth group shadow-sm hover:border-sidebar-border"
            title="First Page"
          >
            <ChevronsLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
          <button
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1 || safeTotalPages <= 1}
            className="p-3 rounded-xl border border-sidebar-border/50 bg-card hover:bg-muted disabled:opacity-20 disabled:pointer-events-none transition-smooth group shadow-sm hover:border-sidebar-border"
            title="Previous Page"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">{renderPageNumbers()}</div>

        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="p-2.5 rounded-xl border border-sidebar-border bg-card/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-smooth group shadow-sm"
            title="Next Page"
          >
            <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages <= 1}
            className="p-2.5 rounded-xl border border-sidebar-border bg-card/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-smooth group shadow-sm"
            title="Last Page"
          >
            <ChevronsRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
