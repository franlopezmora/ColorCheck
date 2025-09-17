"use client";
import Toast from "./Toast";

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: "success" | "error" | "info";
    duration?: number;
  }>;
  onRemoveToast: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}
