import * as React from 'react';

import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide?: () => void;
  className?: string;
}

const getToastIcon = (type: ToastProps['type']): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
};

const getToastColor = (type: ToastProps['type']): string => {
  switch (type) {
    case 'success':
      return 'border-l-green-500';
    case 'error':
      return 'border-l-red-500';
    case 'warning':
      return 'border-l-orange-500';
    case 'info':
    default:
      return 'border-l-blue-500';
  }
};

export const Toast = ({ message, type = 'info', visible, onHide, className }: ToastProps) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'shadow-toast fixed left-4 right-4 top-[60px] z-50 flex items-center rounded-lg border-l-4 bg-white p-3 duration-300 animate-in slide-in-from-top-5',
        getToastColor(type),
        className
      )}
    >
      <span className="mr-2 text-xl">{getToastIcon(type)}</span>
      <p className="line-clamp-2 flex-1 text-sm leading-5 text-foreground">{message}</p>
    </div>
  );
}

// Toast Context for global toast management
interface ToastContextValue {
  showToast: (message: string, type?: ToastProps['type']) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = React.useState<{
    message: string;
    type: ToastProps['type'];
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showToast = React.useCallback((message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type, visible: true });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast {...toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
