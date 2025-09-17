"use client";
import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar el toast
    setIsVisible(true);
    
    // Auto-ocultar después de la duración especificada
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-[var(--success)] text-[var(--success-foreground)]";
      case "error":
        return "bg-[var(--destructive)] text-[var(--destructive-foreground)]";
      case "info":
        return "bg-[var(--primary)] text-[var(--primary-foreground)]";
      default:
        return "bg-[var(--success)] text-[var(--success-foreground)]";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "✅";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border border-[var(--border)] transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getToastStyles()}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
