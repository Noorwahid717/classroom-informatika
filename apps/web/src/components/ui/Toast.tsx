"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react"

export interface ToastMessage {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastContext = React.createContext<{
  addToast: (toast: Omit<ToastMessage, "id">) => void
  removeToast: (id: string) => void
}>({
  addToast: () => {},
  removeToast: () => {}
})

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg transform transition-all duration-300 ${getColors(toast.type)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium">
                  {toast.title}
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {toast.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                  title="Tutup notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

type InlineToastType = ToastMessage["type"]

export interface ToastProps {
  message: string
  type: InlineToastType
  isVisible: boolean
  onClose: () => void
  duration?: number
  title?: string
}

const toastTypeStyles: Record<InlineToastType, string> = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
}

const toastTypeIcons: Record<InlineToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
}

export const Toast = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
  title,
}: ToastProps) => {
  useEffect(() => {
    if (!isVisible) {
      return
    }

    const timeout = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearTimeout(timeout)
    }
  }, [duration, isVisible, onClose])

  const styles = toastTypeStyles[type]
  const icon = useMemo(() => toastTypeIcons[type], [type])

  if (!isVisible) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`pointer-events-auto mx-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ${styles}`}
    >
      <span aria-hidden>{icon}</span>
      <div className="flex-1 text-sm">
        {title ? <p className="font-medium">{title}</p> : null}
        <p>{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-muted-foreground transition hover:text-foreground"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
