import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Text } from "@/components/ui/typography"

interface StatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: LucideIcon
  description?: string
}

export function StatItem({
  label,
  value,
  icon: Icon,
  description,
  className,
  ...props
}: StatItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <Text variant="tiny" className="uppercase tracking-[0.2em]">
          {label}
        </Text>
      </div>
      <div className="flex items-baseline gap-2">
        <Text variant="large" className="text-2xl font-bold tracking-tight">
          {value}
        </Text>
      </div>
      {description && (
        <Text variant="tiny" className="text-muted-foreground/60">
          {description}
        </Text>
      )}
    </div>
  )
}
