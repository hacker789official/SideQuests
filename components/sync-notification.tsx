"use client"

import { useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, Check, Cloud, X } from "lucide-react"

import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md p-3 shadow-md transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SyncNotificationProps
  extends VariantProps<typeof notificationVariants> {
  message: string
  duration?: number
  onClose?: () => void
}

export function SyncNotification({
  message,
  variant,
  duration = 5000,
  onClose,
}: SyncNotificationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <Check className="size-4" />
      case "warning":
      case "error":
        return <AlertTriangle className="size-4" />
      case "info":
      default:
        return <Cloud className="size-4" />
    }
  }

  return (
    <div
      className={cn(
        notificationVariants({ variant }),
        "animate-in fade-in slide-in-from-bottom-5"
      )}
    >
      {getIcon()}
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false)
          if (onClose) onClose()
        }}
        className="ml-2 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="Close notification"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

export interface NotificationManagerProps {}

export function NotificationManager({}: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<
    Array<{ id: string; props: SyncNotificationProps }>
  >([])

  useEffect(() => {
    
    const handleShowNotification = (
      event: CustomEvent<SyncNotificationProps>
    ) => {
      const id = Math.random().toString(36).substring(2, 9)
      setNotifications((prev) => [...prev, { id, props: event.detail }])
    }

    window.addEventListener(
      "showSyncNotification",
      handleShowNotification as EventListener
    )

    return () => {
      window.removeEventListener(
        "showSyncNotification",
        handleShowNotification as EventListener
      )
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    )
  }

  return (
    <>
      {notifications.map(({ id, props }) => (
        <SyncNotification
          key={id}
          {...props}
          onClose={() => removeNotification(id)}
        />
      ))}
    </>
  )
}

export const showNotification = (props: SyncNotificationProps) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("showSyncNotification", { detail: props })
    window.dispatchEvent(event)
  }
}
