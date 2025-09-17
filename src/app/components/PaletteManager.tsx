'use client';

import { useState, useEffect } from 'react';
import { usePaletteStorage, SavedPalette } from '../hooks/usePaletteStorage';

interface PaletteManagerProps {
  currentColors: string[];
  onLoadPalette: (colors: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaletteManager({ currentColors, onLoadPalette, isOpen, onClose }: PaletteManagerProps) {
  const { savedPalettes, isLoading, savePalette, updatePalette, deletePalette, getStats } = usePaletteStorage();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [showColorEditor, setShowColorEditor] = useState<string | null>(null);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [editingColorValue, setEditingColorValue] = useState('');
  const [paletteName, setPaletteName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const stats = getStats();

  const handleSavePalette = async () => {
    if (!paletteName.trim()) {
      setError('El nombre de la paleta es requerido');
      return;
    }

    try {
      await savePalette(paletteName.trim(), currentColors);
      setPaletteName('');
      setShowSaveForm(false);
      setSuccess('Paleta guardada exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la paleta');
    }
  };

  const handleLoadPalette = (palette: SavedPalette) => {
    onLoadPalette(palette.colors);
    onClose();
    setSuccess(`Paleta "${palette.name}" cargada`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeletePalette = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la paleta "${name}"?`)) {
      try {
        deletePalette(id);
        setSuccess('Paleta eliminada');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar la paleta');
      }
    }
  };

  const handleEditPalette = async (id: string, newName: string) => {
    if (!newName.trim()) {
      setError('El nombre de la paleta es requerido');
      return;
    }

    try {
      await updatePalette(id, { name: newName.trim() });
      setShowEditForm(null);
      setSuccess('Paleta actualizada');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la paleta');
    }
  };

  const handleEditColor = (paletteId: string, colorIndex: number, currentColor: string) => {
    setShowColorEditor(paletteId);
    setEditingColorIndex(colorIndex);
    setEditingColorValue(currentColor);
  };

  const handleSaveColorEdit = async (paletteId: string) => {
    if (!editingColorValue.trim()) {
      setError('El color es requerido');
      return;
    }

    // Validar formato HEX
    const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    if (!hexPattern.test(editingColorValue.trim())) {
      setError('Formato de color inválido. Usa formato HEX (ej: #FF0000)');
      return;
    }

    try {
      const palette = savedPalettes.find(p => p.id === paletteId);
      if (!palette || editingColorIndex === null) {
        setError('Error al encontrar la paleta');
        return;
      }

      const newColors = [...palette.colors];
      newColors[editingColorIndex] = editingColorValue.trim();
      
      await updatePalette(paletteId, { colors: newColors });
      setShowColorEditor(null);
      setEditingColorIndex(null);
      setEditingColorValue('');
      setSuccess('Color actualizado');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el color');
    }
  };

  const handleAddColorToPalette = async (paletteId: string) => {
    try {
      const palette = savedPalettes.find(p => p.id === paletteId);
      if (!palette) {
        setError('Error al encontrar la paleta');
        return;
      }

      // Generar un color aleatorio
      const randomColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      };

      const newColors = [...palette.colors, randomColor()];
      await updatePalette(paletteId, { colors: newColors });
      setSuccess('Color agregado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar color');
    }
  };

  const handleRemoveColorFromPalette = async (paletteId: string, colorIndex: number) => {
    try {
      const palette = savedPalettes.find(p => p.id === paletteId);
      if (!palette) {
        setError('Error al encontrar la paleta');
        return;
      }

      if (palette.colors.length <= 1) {
        setError('La paleta debe tener al menos un color');
        return;
      }

      const newColors = palette.colors.filter((_, index) => index !== colorIndex);
      await updatePalette(paletteId, { colors: newColors });
      setSuccess('Color eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar color');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Manejar tecla Escape para cerrar el modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Manejar tecla Escape para cerrar el modal del editor de colores
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showColorEditor) {
        setShowColorEditor(null);
        setEditingColorIndex(null);
        setEditingColorValue('');
        setError('');
      }
    };

    if (showColorEditor) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showColorEditor]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--card)] rounded-lg border border-[var(--border)] max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                Gestor de Paletas
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Guarda y gestiona tus paletas de colores
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg text-[var(--success)] text-sm">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 rounded-lg text-[var(--destructive)] text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--muted)]/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[var(--foreground)]">{stats.totalPalettes}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Paletas</div>
            </div>
            <div className="bg-[var(--muted)]/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[var(--foreground)]">{stats.totalColors}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Colores</div>
            </div>
            <div className="bg-[var(--muted)]/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[var(--foreground)]">
                {stats.lastSaved ? '✓' : '—'}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">Guardado</div>
            </div>
          </div>

          {/* Save Current Palette */}
          {currentColors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Guardar Paleta Actual</h3>
                <button
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="px-3 py-1 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                >
                  {showSaveForm ? 'Cancelar' : 'Guardar'}
                </button>
              </div>

              {showSaveForm && (
                <div className="bg-[var(--primary)]/10 rounded-lg p-4 border border-[var(--primary)]/20">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Nombre de la paleta
                      </label>
                      <input
                        type="text"
                        value={paletteName}
                        onChange={(e) => setPaletteName(e.target.value)}
                        placeholder="Mi paleta favorita"
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSavePalette();
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePalette}
                        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setShowSaveForm(false);
                          setPaletteName('');
                          setError('');
                        }}
                        className="px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Palette Preview */}
              <div className="flex flex-wrap gap-2 mt-3">
                {currentColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-lg border border-[var(--border)]"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Saved Palettes List */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Paletas Guardadas</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-[var(--muted-foreground)]">Cargando paletas...</p>
              </div>
            ) : savedPalettes.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-3">
                  <svg className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <p className="text-[var(--muted-foreground)]">No tienes paletas guardadas</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Guarda tu primera paleta para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className="bg-[var(--muted)]/20 rounded-lg p-4 border border-[var(--border)] hover:border-[var(--muted-foreground)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        {showEditForm === palette.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={palette.name}
                              className="flex-1 px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--primary)]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditPalette(palette.id, e.currentTarget.value);
                                } else if (e.key === 'Escape') {
                                  setShowEditForm(null);
                                }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditPalette(palette.id, (document.querySelector(`input[defaultValue="${palette.name}"]`) as HTMLInputElement)?.value || '')}
                              className="px-2 py-1 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:bg-[var(--primary)]/90"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setShowEditForm(null)}
                              className="px-2 py-1 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded hover:bg-[var(--secondary)]/80"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <h4 className="font-medium text-[var(--foreground)]">{palette.name}</h4>
                        )}
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {palette.colors.length} colores • {formatDate(palette.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadPalette(palette)}
                          className="px-3 py-1 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:bg-[var(--primary)]/90 transition-colors"
                          title="Cargar paleta"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => setShowEditForm(showEditForm === palette.id ? null : palette.id)}
                          className="px-2 py-1 text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded hover:bg-[var(--secondary)]/80 transition-colors"
                          title="Editar nombre"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePalette(palette.id, palette.name)}
                          className="px-2 py-1 text-xs bg-[var(--destructive)] text-[var(--destructive-foreground)] rounded hover:bg-[var(--destructive)]/90 transition-colors"
                          title="Eliminar paleta"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {/* Color Preview with Edit Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--muted-foreground)]">Colores ({palette.colors.length})</span>
                        <button
                          onClick={() => handleAddColorToPalette(palette.id)}
                          className="text-xs px-2 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:bg-[var(--primary)]/90 transition-colors"
                          title="Agregar color"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {palette.colors.map((color, index) => (
                          <div
                            key={index}
                            className="relative group"
                          >
                            <div
                              className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors"
                              style={{ backgroundColor: color }}
                              title={`${color} - Click para editar`}
                              onClick={() => handleEditColor(palette.id, index, color)}
                            />
                            <button
                              onClick={() => handleRemoveColorFromPalette(palette.id, index)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--destructive)] text-[var(--destructive-foreground)] rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--destructive)]/90"
                              title="Eliminar color"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color Editor Modal */}
      {showColorEditor && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4"
          onClick={() => {
            setShowColorEditor(null);
            setEditingColorIndex(null);
            setEditingColorValue('');
            setError('');
          }}
        >
          <div 
            className="bg-[var(--card)] rounded-lg border border-[var(--border)] max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  Editar Color
                </h3>
                <button
                  onClick={() => {
                    setShowColorEditor(null);
                    setEditingColorIndex(null);
                    setEditingColorValue('');
                    setError('');
                  }}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--muted)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Color Preview */}
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg border-2 border-[var(--border)]"
                    style={{ backgroundColor: editingColorValue || '#000000' }}
                  />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Vista previa</p>
                    <p className="font-mono text-sm text-[var(--foreground)]">
                      {editingColorValue || '#000000'}
                    </p>
                  </div>
                </div>

                {/* Color Input */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Código HEX
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <input
                        type="color"
                        value={editingColorValue}
                        onChange={(e) => setEditingColorValue(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                        className="w-full h-full rounded-lg border-2 border-[var(--border)] cursor-pointer"
                        style={{ backgroundColor: editingColorValue || '#000000' }}
                      />
                    </div>
                    <input
                      type="text"
                      value={editingColorValue}
                      onChange={(e) => setEditingColorValue(e.target.value)}
                      placeholder="#FF0000"
                      className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveColorEdit(showColorEditor);
                        } else if (e.key === 'Escape') {
                          setShowColorEditor(null);
                          setEditingColorIndex(null);
                          setEditingColorValue('');
                          setError('');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveColorEdit(showColorEditor)}
                    className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowColorEditor(null);
                      setEditingColorIndex(null);
                      setEditingColorValue('');
                      setError('');
                    }}
                    className="px-4 py-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg hover:bg-[var(--secondary)]/80 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-[var(--muted-foreground)]">
                  💡 Puedes usar el selector de color o escribir el código HEX directamente
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
