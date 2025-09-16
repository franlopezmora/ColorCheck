'use client';

interface HexagonalColorGridProps {
  colors: string[];
  onColorSelect?: (color: string) => void;
  selectedColor?: string;
  maxColors?: number;
}

export default function HexagonalColorGrid({ 
  colors, 
  onColorSelect, 
  selectedColor,
  maxColors = 25 
}: HexagonalColorGridProps) {
  
  // Crear una cuadrícula hexagonal de 5x5
  const createHexagonalGrid = () => {
    const grid = [];
    const rows = 5;
    const cols = 5;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const color = colors[index] || '#f3f4f6'; // Color gris por defecto
        const isSelected = selectedColor === color;
        
        grid.push({
          color,
          index,
          row,
          col,
          isSelected,
          isEmpty: !colors[index]
        });
      }
    }
    
    return grid;
  };

  const gridItems = createHexagonalGrid();

  return (
    <div className="hexagonal-grid">
      <div className="grid-container">
        {gridItems.map((item) => (
          <div
            key={`${item.row}-${item.col}`}
            className={`hexagon ${item.isSelected ? 'selected' : ''} ${item.isEmpty ? 'empty' : ''}`}
            style={{
              backgroundColor: item.color,
              gridColumn: item.col + 1,
              gridRow: item.row + 1,
            }}
            onClick={() => item.color !== '#f3f4f6' && onColorSelect?.(item.color)}
            title={item.isEmpty ? 'Color vacío' : `${item.color}`}
          >
            {item.isEmpty && (
              <div className="empty-indicator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .hexagonal-grid {
          display: flex;
          justify-content: center;
          padding: 1rem;
        }
        
        .grid-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: 2px;
          width: 200px;
          height: 200px;
          transform: rotate(45deg);
        }
        
        .hexagon {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 2px solid transparent;
        }
        
        .hexagon:hover {
          transform: scale(1.1);
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }
        
        .hexagon.selected {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary);
          transform: scale(1.05);
        }
        
        .hexagon.empty {
          background-color: var(--muted);
          border: 2px dashed var(--border);
          cursor: default;
        }
        
        .hexagon.empty:hover {
          transform: none;
          border-color: var(--border);
          box-shadow: none;
        }
        
        .empty-indicator {
          color: var(--muted-foreground);
          opacity: 0.5;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .grid-container {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
}
