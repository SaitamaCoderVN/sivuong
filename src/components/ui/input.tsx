import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-slate-400 selection:bg-primary/20 selection:text-primary border-slate-200 h-10 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-base shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "hover:border-slate-300 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10",
          className
        )}
      {...props}
    />
  )
}

export { Input }
