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

  const openCommandPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Manejar atajo Ctrl+K (o Cmd+K en Mac)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verificar si es Ctrl+K (Windows/Linux) o Cmd+K (Mac)
      const isCtrlK = (event.ctrlKey || event.metaKey) && event.key === 'k';
      
      if (isCtrlK) {
        event.preventDefault();
        toggleCommandPalette();
      }

      // Cerrar con Escape cuando está abierto
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeCommandPalette();
      }
    };

    // Agregar listener solo cuando el componente está montado
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleCommandPalette, closeCommandPalette]);

  return {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette
  };
}
