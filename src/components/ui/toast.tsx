
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { motion, PanInfo } from "framer-motion"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed z-[150] flex flex-col p-4",
        isClient && isMobile 
          ? "top-0 items-center w-full" 
          : "top-0 sm:right-0 sm:items-end w-full sm:w-auto",
        className
      )}
      {...props}
    />
  );
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "pointer-events-auto text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 border backdrop-blur-md w-full max-w-sm sm:max-w-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-yellow-600/90 to-yellow-500/80 border-yellow-400/30",
        destructive: "bg-gradient-to-r from-red-700/95 to-red-600/85 border-red-400/30",
        success: "bg-gradient-to-r from-green-600/95 to-green-500/85 border-green-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, onOpenChange, ...props }, ref) => {
  
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const desktopVariants = {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: "100%" },
  };

  const mobileVariants = {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const offset = info.offset.x;
    const velocity = info.velocity.x;
        
    if (offset > threshold || velocity > 500) {
        if (onOpenChange) onOpenChange(false);
    }
  };

  const dragDirection = "x";
  const animationVariants = isClient && isMobile ? mobileVariants : desktopVariants;

  return (
      <ToastPrimitives.Root
          ref={ref}
          asChild
          onOpenChange={onOpenChange}
          {...props}
      >
        <motion.li
          layout
          initial="initial"
          animate="animate"
          exit="exit"
          variants={animationVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag={dragDirection}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className={cn(toastVariants({ variant }), className)}
        >
          {props.children}
        </motion.li>
      </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName


const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 items-center justify-center rounded-full border border-white/30 bg-transparent px-3 text-xs font-semibold ring-offset-background transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = ToastPrimitives.Close

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & {
    variant?: VariantProps<typeof toastVariants>["variant"]
  }
>(({ className, variant, children, ...props }, ref) => {
  const Icon = variant === 'success' ? CheckCircle2 : variant === 'destructive' ? AlertTriangle : Info;
  const iconColor = variant === 'success' ? 'text-green-300' : variant === 'destructive' ? 'text-red-200' : 'text-yellow-200';
  
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn("flex items-center gap-2 font-medium text-sm tracking-wide", className)}
      {...props}
    >
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span>{children}</span>
    </ToastPrimitives.Title>
  )
})
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs opacity-80", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
