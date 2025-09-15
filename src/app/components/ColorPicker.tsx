"use client";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-3">
        {/* Color Input */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-mono text-sm"
          aria-label="Ingresa el código HEX del color"
        />
        
        {/* Native Color Picker */}
        <input
          type="color"
          value={value}
          onChange={handleInputChange}
          className="w-12 h-10 rounded-lg border-2 border-[var(--border)] cursor-pointer focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          aria-label="Selector de color visual"
        />
      </div>

    </div>
  );
}
