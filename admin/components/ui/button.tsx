import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#8E2DE2]/40 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-gradient)] text-white shadow-[0_10px_30px_rgba(233,30,141,0.35)] hover:opacity-95 active:scale-[0.98]",
        ghost:
          "hover:bg-white/5 dark:hover:bg-white/10",
        secondary:
          "bg-white/10 dark:bg-white/5 border border-white/20 text-foreground hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm",
        outline:
          "border border-white/30 bg-transparent text-foreground hover:bg-white/10 backdrop-blur-sm",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-[0_10px_30px_rgba(239,68,68,0.3)]",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }