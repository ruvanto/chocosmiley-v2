
"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastTitle,
  ToastProvider,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={2500}>
      {toasts.map(function ({ id, title, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center justify-between w-full gap-3">
              {title && <ToastTitle variant={props.variant}>{title}</ToastTitle>}
              {action}
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
