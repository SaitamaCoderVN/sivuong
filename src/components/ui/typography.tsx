import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva(
  "font-semibold tracking-tight text-foreground",
  {
    variants: {
      level: {
        h1: "text-4xl lg:text-5xl font-extrabold",
        h2: "text-3xl border-b pb-2",
        h3: "text-2xl",
        h4: "text-xl",
        h5: "text-lg",
        h6: "text-base",
      },
    },
    defaultVariants: {
      level: "h1",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, as, ...props }, ref) => {
    const Component = as || level || "h1"
    return (
      <Component
        className={cn(headingVariants({ level, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

const textVariants = cva(
  "leading-7",
  {
    variants: {
      variant: {
        default: "text-base",
        muted: "text-sm text-muted-foreground",
        large: "text-lg font-semibold",
        small: "text-sm font-medium leading-none",
        tiny: "text-xs font-medium text-muted-foreground",
        blockquote: "mt-6 border-l-2 pl-6 italic",
        lead: "text-xl text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div"
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, as = "p", ...props }, ref) => {
    const Component = as
    return (
      <Component
        className={cn(textVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Heading, Text, headingVariants, textVariants }
