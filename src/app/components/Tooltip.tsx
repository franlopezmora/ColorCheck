"use client";
import { useState, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export default function Tooltip({ 
  children, 
  content, 
  position = "top", 
  delay = 200,
  className = ""
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 transform -translate-x-1/2 border-t-[var(--card)] border-t-4 border-x-4 border-x-transparent";
      case "bottom":
        return "bottom-full left-1/2 transform -translate-x-1/2 border-b-[var(--card)] border-b-4 border-x-4 border-x-transparent";
      case "left":
        return "left-full top-1/2 transform -translate-y-1/2 border-l-[var(--card)] border-l-4 border-y-4 border-y-transparent";
      case "right":
        return "right-full top-1/2 transform -translate-y-1/2 border-r-[var(--card)] border-r-4 border-y-4 border-y-transparent";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 border-t-[var(--card)] border-t-4 border-x-4 border-x-transparent";
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-[var(--card-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg ${typeof content === 'string' ? 'whitespace-nowrap' : 'max-w-xs'} ${getPositionClasses()}`}
          role="tooltip"
        >
          {content}
          <div className={`absolute w-0 h-0 ${getArrowClasses()}`}></div>
        </div>
      )}
    </div>
  );
}
