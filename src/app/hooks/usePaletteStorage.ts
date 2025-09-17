'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SavedPalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'colorcheck-saved-palettes';

export function usePaletteStorage() {
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar paletas del localStorage al inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir las fechas de string a Date
        const palettes = parsed.map((palette: SavedPalette & { createdAt: string; updatedAt: string }) => ({
          ...palette,
          createdAt: new Date(palette.createdAt),
          updatedAt: new Date(palette.updatedAt)
        }));
        setSavedPalettes(palettes);
      }
    } catch (error) {
      console.error('Error cargando paletas guardadas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar paletas en localStorage
  const saveToStorage = useCallback((palettes: SavedPalette[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
      setSavedPalettes(palettes);
    } catch (error) {
      console.error('Error guardando paletas:', error);
      throw new Error('No se pudo guardar la paleta');
    }
  }, []);

  // Guardar una nueva paleta
  const savePalette = useCallback((name: string, colors: string[]): SavedPalette => {
    if (!name.trim()) {
      throw new Error('El nombre de la paleta es requerido');
    }
    
    if (colors.length === 0) {
      throw new Error('La paleta debe tener al menos un color');
    }

    // Verificar si ya existe una paleta con el mismo nombre
    const existingPalette = savedPalettes.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPalette) {
      throw new Error('Ya existe una paleta con ese nombre');
    }

    const newPalette: SavedPalette = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      colors: [...colors], // Crear una copia del array
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedPalettes = [...savedPalettes, newPalette];
    saveToStorage(updatedPalettes);
    
    return newPalette;
  }, [savedPalettes, saveToStorage]);

  // Actualizar una paleta existente
  const updatePalette = useCallback((id: string, updates: Partial<Pick<SavedPalette, 'name' | 'colors'>>): SavedPalette => {
    const paletteIndex = savedPalettes.findIndex(p => p.id === id);
    if (paletteIndex === -1) {
      throw new Error('Paleta no encontrada');
    }

    const palette = savedPalettes[paletteIndex];
    
    // Verificar nombre único si se está cambiando
    if (updates.name && updates.name.toLowerCase() !== palette.name.toLowerCase()) {
      const existingPalette = savedPalettes.find(p => p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase());
      if (existingPalette) {
        throw new Error('Ya existe una paleta con ese nombre');
      }
    }

    const updatedPalette: SavedPalette = {
      ...palette,
      ...updates,
      updatedAt: new Date()
    };

    const updatedPalettes = [...savedPalettes];
    updatedPalettes[paletteIndex] = updatedPalette;
    saveToStorage(updatedPalettes);
    
    return updatedPalette;
  }, [savedPalettes, saveToStorage]);

  // Eliminar una paleta
  const deletePalette = useCallback((id: string): void => {
    const updatedPalettes = savedPalettes.filter(p => p.id !== id);
    saveToStorage(updatedPalettes);
  }, [savedPalettes, saveToStorage]);

  // Cargar una paleta específica
  const loadPalette = useCallback((id: string): SavedPalette | null => {
    return savedPalettes.find(p => p.id === id) || null;
  }, [savedPalettes]);

  // Obtener estadísticas
  const getStats = useCallback(() => {
    return {
      totalPalettes: savedPalettes.length,
      totalColors: savedPalettes.reduce((sum, palette) => sum + palette.colors.length, 0),
      lastSaved: savedPalettes.length > 0 ? Math.max(...savedPalettes.map(p => p.updatedAt.getTime())) : null
    };
  }, [savedPalettes]);

  return {
    savedPalettes,
    isLoading,
    savePalette,
    updatePalette,
    deletePalette,
    loadPalette,
    getStats
  };
}
