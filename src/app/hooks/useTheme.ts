"use client";
import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("colorcheck-theme") as Theme;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    
    if (theme === "light") {
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#171717");
      root.style.setProperty("--card", "#f8f9fa");
      root.style.setProperty("--card-foreground", "#171717");
      root.style.setProperty("--border", "#e5e7eb");
      root.style.setProperty("--input", "#ffffff");
      root.style.setProperty("--primary", "#3b82f6");
      root.style.setProperty("--primary-foreground", "#ffffff");
      root.style.setProperty("--secondary", "#f1f5f9");
      root.style.setProperty("--secondary-foreground", "#171717");
      root.style.setProperty("--muted", "#f1f5f9");
      root.style.setProperty("--muted-foreground", "#64748b");
      root.style.setProperty("--accent", "#f1f5f9");
      root.style.setProperty("--accent-foreground", "#171717");
      root.style.setProperty("--destructive", "#ef4444");
      root.style.setProperty("--destructive-foreground", "#ffffff");
      root.style.setProperty("--success", "#10b981");
      root.style.setProperty("--success-foreground", "#ffffff");
      root.style.setProperty("--warning", "#f59e0b");
      root.style.setProperty("--warning-foreground", "#ffffff");
    } else {
      root.style.setProperty("--background", "#0f0f0f");
      root.style.setProperty("--foreground", "#ffffff");
      root.style.setProperty("--card", "#1a1a1a");
      root.style.setProperty("--card-foreground", "#ffffff");
      root.style.setProperty("--border", "#2a2a2a");
      root.style.setProperty("--input", "#1a1a1a");
      root.style.setProperty("--primary", "#3b82f6");
      root.style.setProperty("--primary-foreground", "#ffffff");
      root.style.setProperty("--secondary", "#262626");
      root.style.setProperty("--secondary-foreground", "#ffffff");
      root.style.setProperty("--muted", "#262626");
      root.style.setProperty("--muted-foreground", "#a3a3a3");
      root.style.setProperty("--accent", "#262626");
      root.style.setProperty("--accent-foreground", "#ffffff");
      root.style.setProperty("--destructive", "#ef4444");
      root.style.setProperty("--destructive-foreground", "#ffffff");
      root.style.setProperty("--success", "#10b981");
      root.style.setProperty("--success-foreground", "#ffffff");
      root.style.setProperty("--warning", "#f59e0b");
      root.style.setProperty("--warning-foreground", "#ffffff");
    }
    
    // Save theme preference
    localStorage.setItem("colorcheck-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return {
    theme,
    toggleTheme,
    mounted
  };
}
