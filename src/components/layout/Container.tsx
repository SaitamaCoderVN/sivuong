import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Container({ 
  children, 
  className, 
  size = "md",
  ...props 
}: ContainerProps) {
  const sizes = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div 
      className={cn("mx-auto w-full px-6", sizes[size], className)} 
      {...props}
    >
      {children}
    </div>
  );
}
