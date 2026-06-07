'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  points?: number
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], points?: number) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success', points?: number) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, points }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-4 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-slide-up"
            style={{ animation: 'slideUp 0.3s ease' }}
          >
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg"
              style={{
                background: toast.type === 'success' ? '#0a0a0a' : toast.type === 'error' ? '#0a0a0a' : '#0a0a0a',
                border: toast.type === 'success' ? '1px solid rgba(0,255,135,0.3)' : toast.type === 'error' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{
                  background: toast.type === 'success' ? 'rgba(0,255,135,0.1)' : toast.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                }}
              >
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {toast.points && toast.points > 0 && (
                  <p style={{ color: '#00ff87', fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                    +{toast.points} Bug Points ⚡
                  </p>
                )}
                <p style={{ color: toast.type === 'success' ? 'rgba(255,255,255,0.7)' : toast.type === 'error' ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                  {toast.message}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
