'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseCommandPaletteReturn {
  isOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
}

export function useCommandPalette(): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openCommandPalette = useCallback(() => setIsOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsOpen(false), []);
  const toggleCommandPalette = useCallback(() => setIsOpen(p => !p), []);

  useEffect(() => {
    const isMac =
      typeof window !== 'undefined' &&
      /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // --- Abrir paleta ---
      // macOS: Cmd+K
      const openOnMacCmdK = isMac && event.metaKey && !event.repeat && (event.code === 'KeyK' || key === 'k');
      // Win/Linux: Ctrl+K (pedido) + backup Ctrl+Space y Ctrl+/
      const openOnWinCtrlK = !isMac && event.ctrlKey && !event.repeat && (event.code === 'KeyK' || key === 'k');
      const openOnCtrlSpace = !isMac && event.ctrlKey && !event.repeat && event.code === 'Space';
      const openOnCtrlSlash = !isMac && event.ctrlKey && !event.repeat && (event.code === 'Slash' || key === '/');

      if (!isOpen && (openOnMacCmdK || openOnWinCtrlK || openOnCtrlSpace || openOnCtrlSlash)) {
        event.preventDefault();
        event.stopPropagation();
        openCommandPalette();
        return;
      }

      // --- Cerrar con Escape ---
      if (isOpen && key === 'escape') {
        event.preventDefault();
        event.stopPropagation();
        closeCommandPalette();
      }
    };

    // capture:true para interceptar antes que inputs
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, openCommandPalette, closeCommandPalette]);

  return {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
  };
}
