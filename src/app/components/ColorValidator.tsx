"use client";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateColor(color: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if color is empty
  if (!color || color.trim() === "") {
    errors.push("El color no puede estar vacío");
    return { isValid: false, errors, warnings, suggestions };
  }

  const trimmedColor = color.trim();

  // Check HEX format
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (!hexPattern.test(trimmedColor)) {
    errors.push("Formato HEX inválido. Use #RGB o #RRGGBB");
    suggestions.push("Ejemplos válidos: #000, #000000, #fff, #ffffff");
    return { isValid: false, errors, warnings, suggestions };
  }

  // Check for common mistakes
  if (trimmedColor.length === 4) {
    // Short hex format
    const chars = trimmedColor.slice(1);
    if (chars.split('').every(char => char === chars[0])) {
      warnings.push("Color monocromático detectado");
    }
  } else if (trimmedColor.length === 7) {
    // Long hex format
    const r = trimmedColor.slice(1, 3);
    const g = trimmedColor.slice(3, 5);
    const b = trimmedColor.slice(5, 7);
    
    if (r === g && g === b) {
      warnings.push("Color monocromático detectado");
    }
    
    // Check for very dark colors
    const rNum = parseInt(r, 16);
    const gNum = parseInt(g, 16);
    const bNum = parseInt(b, 16);
    const avg = (rNum + gNum + bNum) / 3;
    
    if (avg < 20) {
      warnings.push("Color muy oscuro detectado");
      suggestions.push("Considere usar un color más claro para mejor legibilidad");
    } else if (avg > 235) {
      warnings.push("Color muy claro detectado");
      suggestions.push("Considere usar un color más oscuro para mejor legibilidad");
    }
  }

  return { isValid: true, errors, warnings, suggestions };
}

export function validatePalette(colors: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (colors.length === 0) {
    errors.push("La paleta no puede estar vacía");
    return { isValid: false, errors, warnings, suggestions };
  }

  if (colors.length < 2) {
    errors.push("Se necesitan al menos 2 colores para analizar");
    return { isValid: false, errors, warnings, suggestions };
  }

  if (colors.length > 10) {
    warnings.push("Muchos colores en la paleta");
    suggestions.push("Considere reducir a 5-7 colores para mejor usabilidad");
  }

  // Check for duplicates
  const uniqueColors = new Set(colors.map(c => c.toLowerCase()));
  if (uniqueColors.size !== colors.length) {
    warnings.push("Colores duplicados detectados");
    suggestions.push("Elimine los colores duplicados para optimizar el análisis");
  }

  // Validate each color
  const colorValidations = colors.map(validateColor);
  const invalidColors = colorValidations.filter(v => !v.isValid);
  
  if (invalidColors.length > 0) {
    errors.push(`${invalidColors.length} color(es) inválido(s)`);
    invalidColors.forEach((validation, index) => {
      errors.push(...validation.errors.map(e => `Color ${index + 1}: ${e}`));
    });
  }

  // Collect warnings and suggestions from individual colors
  colorValidations.forEach((validation, index) => {
    warnings.push(...validation.warnings.map(w => `Color ${index + 1}: ${w}`));
    suggestions.push(...validation.suggestions.map(s => `Color ${index + 1}: ${s}`));
  });

  // Check color diversity
  if (colors.length >= 3) {
    const hexValues = colors.map(c => c.toLowerCase().replace('#', ''));
    const allSimilar = hexValues.every(hex => {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const avg = (r + g + b) / 3;
      return Math.abs(avg - 128) < 50; // All colors are around middle gray
    });
    
    if (allSimilar) {
      warnings.push("Paleta con colores muy similares");
      suggestions.push("Considere agregar más contraste entre los colores");
    }
  }

  return { 
    isValid: errors.length === 0, 
    errors, 
    warnings, 
    suggestions 
  };
}

export function getContrastLevel(ratio: number): { level: string; color: string } {
  if (ratio >= 7) {
    return { level: "Excelente", color: "text-green-600" };
  } else if (ratio >= 4.5) {
    return { level: "Bueno", color: "text-blue-600" };
  } else if (ratio >= 3) {
    return { level: "Aceptable", color: "text-yellow-600" };
  } else {
    return { level: "Pobre", color: "text-red-600" };
  }
}
