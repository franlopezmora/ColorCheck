# 🎨 ColorCheck

**Analizador de Accesibilidad de Paletas de Colores**

Una herramienta moderna y profesional para analizar la accesibilidad de paletas de colores según los estándares WCAG AA y AAA. ColorCheck te ayuda a crear diseños inclusivos verificando automáticamente el contraste entre colores y generando combinaciones accesibles.

![ColorCheck Logo](https://img.shields.io/badge/ColorCheck-v1.0-blue?style=for-the-badge&logo=color-sampler)

## ✨ Características

### 🔍 **Análisis Automático**
- **Verificación WCAG**: Cumple con estándares AA Normal (4.5:1), AA Large (3:1) y AAA Normal (7:1)
- **Análisis en Tiempo Real**: Los resultados se actualizan automáticamente al cambiar los colores
- **Múltiples Estándares**: Soporte para diferentes niveles de accesibilidad según el tipo de contenido

### 🎨 **Generador de Paletas**
- **Armonías de Color**: Complementario, Análogo, Triádico, Tetrádico y Monocromático
- **Color Base Personalizable**: Selecciona cualquier color como punto de partida
- **Generación Inteligente**: Algoritmos basados en teoría del color para crear paletas armónicas

### 📊 **Análisis Detallado**
- **Panel de Estadísticas**: Métricas completas de accesibilidad y contraste
- **Advertencias Inteligentes**: Detecta problemas potenciales en la paleta
- **Sugerencias de Mejora**: Recomendaciones automáticas para optimizar la accesibilidad

### 📤 **Exportación Completa**
- **Múltiples Formatos**: CSS, SCSS, Tailwind CSS, JSON
- **Integración con Figma**: Exportación en formato Markdown y JSON para Figma
- **Código Listo para Usar**: Variables CSS y clases pre-generadas

### 🌐 **API REST**
- **Endpoint `/api/pairs`**: Analiza paletas y devuelve combinaciones accesibles
- **Endpoint `/api/tokens`**: Información sobre tokens de color
- **Documentación Integrada**: Interfaz de usuario con ejemplos de uso

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/franlopezmora/colorcheck.git
cd colorcheck

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construcción para Producción

```bash
# Construir la aplicación
pnpm build

# Ejecutar en producción
pnpm start
```

## 🎯 Cómo Usar

### 1. **Agregar Colores**
- Usa el selector de color visual
- Ingresa códigos HEX directamente
- Importa colores desde otras herramientas

### 2. **Seleccionar Estándar**
- **AA Normal (4.5:1)**: Para textos de párrafo estándar
- **AA Large (3:1)**: Para textos grandes (24px+)
- **AAA Normal (7:1)**: Para máxima accesibilidad

### 3. **Revisar Resultados**
- Ve las combinaciones accesibles encontradas
- Revisa los niveles de contraste
- Copia el código CSS directamente

### 4. **Generar Paletas**
- Selecciona un color base
- Elige el tipo de armonía
- Genera automáticamente una paleta armónica

## 🔧 API Reference

### POST `/api/pairs`

Analiza una paleta de colores y devuelve combinaciones accesibles.

**Parámetros:**
```json
{
  "palette": ["#0EA5E9", "#111827", "#F59E0B"],
  "threshold": "aa_normal",
  "limit": 20
}
```

**Respuesta:**
```json
{
  "ok": true,
  "threshold": "aa_normal",
  "pairs": [
    {
      "fg": "#111827",
      "bg": "#0EA5E9", 
      "ratio": 4.8,
      "passes": ["aa_normal", "aa_large"]
    }
  ]
}
```

### GET `/api/tokens`

Obtiene información sobre tokens de color y variables CSS.

**Respuesta:**
```json
{
  "ok": true,
  "tokens": {
    "primary": "#0EA5E9",
    "secondary": "#111827",
    "accent": "#F59E0B"
  }
}
```

## 🏗️ Arquitectura del Proyecto

```
colorcheck/
├── src/
│   ├── app/
│   │   ├── api/                         # API Routes
│   │   │   ├── analyze/                 # Análisis de colores
│   │   │   ├── pairs/                   # Combinaciones accesibles
│   │   │   └── tokens/                  # Tokens de color
│   │   ├── components/                  # Componentes React
│   │   │   ├── ColorPalette.tsx         # Selector de colores
│   │   │   ├── PaletteGenerator.tsx     # Generador de paletas
│   │   │   ├── AnalysisPanel.tsx        # Panel de análisis
│   │   │   ├── ExportPanel.tsx          # Panel de exportación
│   │   │   └── ...
│   │   ├── hooks/                       # Custom Hooks
│   │   └── globals.css                  # Estilos globales
├── lib/                                 # Lógica de negocio
│   ├── colors.ts                        # Manipulación de colores
│   ├── contrast.ts                      # Cálculo de contraste
│   ├── wcag.ts                          # Estándares WCAG
│   └── index.ts                         # API principal
└── public/                              # Assets estáticos
```

## 🎨 Tecnologías Utilizadas

### Frontend
- **Next.js 15.5.3**: Framework React con App Router
- **React 19.1.0**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Framework de estilos utilitarios

### Backend
- **Next.js API Routes**: API REST integrada
- **Algoritmos de Color**: Conversión HEX/HSL/RGB
- **Cálculo de Contraste**: Implementación WCAG 2.1

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **pnpm**: Gestor de paquetes
- **PostCSS**: Procesamiento de CSS

## 📋 Estándares WCAG Implementados

| Estándar | Contraste Mínimo | Uso Recomendado |
|----------|------------------|-----------------|
| **AA Normal** | 4.5:1 | Textos de párrafo (~18px) |
| **AA Large** | 3:1 | Textos grandes (~24px) |
| **AAA Normal** | 7:1 | Máxima accesibilidad |
| **AAA Large** | 4.5:1 | Textos grandes AAA |
| **UI Graphic** | 3:1 | Elementos de interfaz |

## 🌟 Características Avanzadas

### 🎨 **Generador de Paletas Inteligente**
- **Armonía Complementaria**: Colores opuestos en el círculo cromático
- **Armonía Análoga**: Colores adyacentes para transiciones suaves
- **Armonía Triádica**: Tres colores separados 120° para máximo contraste
- **Armonía Tetrádica**: Cuatro colores para paletas complejas
- **Armonía Monocromática**: Variaciones de un solo tono

### 📊 **Análisis Profundo**
- **Detección de Problemas**: Identifica colores problemáticos automáticamente
- **Métricas de Accesibilidad**: Porcentaje de combinaciones accesibles
- **Análisis de Temperatura**: Detecta paletas cálidas/frías
- **Sugerencias Contextuales**: Recomendaciones basadas en el análisis

### 🔄 **Exportación Flexible**
- **CSS Variables**: Variables CSS listas para usar
- **SCSS**: Compatible con preprocesadores
- **Tailwind CSS**: Clases utilitarias personalizadas
- **JSON**: Datos estructurados para integración
- **Figma**: Formatos específicos para diseño

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Áreas de Contribución
- 🐛 **Bug Fixes**: Corrección de errores
- ✨ **Nuevas Features**: Funcionalidades adicionales
- 📚 **Documentación**: Mejoras en la documentación
- 🎨 **UI/UX**: Mejoras en la interfaz
- ⚡ **Performance**: Optimizaciones de rendimiento

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Francisco López Mora**
- 📧 Email: franciscolopezmora3@gmail.com
- 🐙 GitHub: [@franlopezmora](https://github.com/franlopezmora)
- 💼 LinkedIn: [Francisco López Mora](https://linkedin.com/in/franciscolopezmora)


<div align="center">

**¿Te gusta ColorCheck? ¡Dale una ⭐ al repositorio!**

[![GitHub stars](https://img.shields.io/github/stars/franlopezmora/colorcheck?style=social)](https://github.com/franlopezmora/colorcheck)
[![GitHub forks](https://img.shields.io/github/forks/franlopezmora/colorcheck?style=social)](https://github.com/franlopezmora/colorcheck)

</div>
