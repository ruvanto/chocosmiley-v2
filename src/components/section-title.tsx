import { cn } from "@/lib/utils";

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function SectionTitle({ children, className, ...props }: SectionTitleProps) {
  return (
    <h2 className={cn("text-2xl font-bold text-white mb-4 pl-4", className)} {...props}>
      {children}
    </h2>
  )
}
