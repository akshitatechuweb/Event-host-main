"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(showMax / 2));
    let endPage = Math.min(totalPages, startPage + showMax - 1);
    
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
            i === currentPage
              ? "bg-gradient-to-br from-sidebar-primary to-violet-600 text-white shadow-lg shadow-sidebar-primary/25 scale-110"
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
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-2", className)}>
      <div className="text-sm font-medium text-muted-foreground/60 order-2 sm:order-1">
        Page <span className="text-foreground">{currentPage}</span> of <span className="text-foreground">{totalPages}</span>
      </div>
      
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <div className="flex items-center gap-1.5 mr-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-sidebar-border bg-card/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-smooth group shadow-sm"
            title="First Page"
          >
            <ChevronsLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-sidebar-border bg-card/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-smooth group shadow-sm"
            title="Previous Page"
          >
            <ChevronLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {renderPageNumbers()}
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-sidebar-border bg-card/60 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-smooth group shadow-sm"
            title="Next Page"
          >
            <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform text-muted-foreground" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
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
