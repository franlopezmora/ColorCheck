"use client";
import { useTheme } from "../hooks/useTheme";
import { useState, useRef } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-[var(--card)] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-[var(--muted-foreground)] animate-pulse"></div>
      </button>
    );
  }

  const handleClick = () => {
    toggleTheme();
    // No resetear el estado hover para mantener el efecto visual
    // setIsHovered(false);
    // Mantener el foco en el botón después del cambio de tema
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-2 rounded-lg bg-[var(--card)] hover:bg-[var(--muted)]/100 flex items-center justify-center transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]`}
      aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
      title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
    >
      {theme === "light" ? (
        <svg
          className="w-5 h-5 text-current"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-current"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}
