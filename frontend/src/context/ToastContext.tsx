import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastVariant = 'success' | 'error' | 'warning'

interface ToastItem {
  id: number
  variant: ToastVariant
  title: string
  message?: string
}

interface ToastContextValue {
  showToast: (variant: ToastVariant, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: string; iconColor: string }> = {
  success: { border: 'border-cova-teal', icon: '✓', iconColor: 'text-cova-teal' },
  error: { border: 'border-red-600', icon: '✕', iconColor: 'text-red-600' },
  warning: { border: 'border-cova-orange', icon: '!', iconColor: 'text-cova-orange' },
}

let nextToastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = nextToastId++
    setToasts((current) => [...current, { id, variant, title, message }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex w-full max-w-90 flex-col gap-3">
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant]
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-2.5 rounded-[10px] border-l-4 bg-white p-3.5 shadow-lg ${style.border}`}
            >
              <span className={`text-base leading-tight ${style.iconColor}`}>{style.icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-neutral-900">{toast.title}</span>
                {toast.message && <span className="text-xs text-neutral-500">{toast.message}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
