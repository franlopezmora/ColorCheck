"use client";
import Tooltip from "./Tooltip";

interface WCAGTooltipProps {
  children: React.ReactNode;
  standard: "aa_normal" | "aa_large" | "aaa_normal" | "aaa_large" | "ui_graphic";
}

const wcagInfo = {
  aa_normal: {
    title: "WCAG AA Normal",
    description: "Estándar mínimo de accesibilidad para texto normal. Requiere un ratio de contraste de al menos 4.5:1.",
    details: "Aplicable a texto de tamaño normal (menos de 18pt o 14pt en negrita). Es el estándar mínimo recomendado para la mayoría de aplicaciones web."
  },
  aa_large: {
    title: "WCAG AA Large",
    description: "Estándar AA para texto grande. Requiere un ratio de contraste de al menos 3:1.",
    details: "Aplicable a texto grande (18pt o más, o 14pt en negrita o más). Texto más grande es más fácil de leer, por lo que requiere menos contraste."
  },
  aaa_normal: {
    title: "WCAG AAA Normal",
    description: "Estándar AAA para texto normal. Requiere un ratio de contraste de al menos 7:1.",
    details: "Estándar más estricto que proporciona mejor accesibilidad. Recomendado para aplicaciones que requieren máxima legibilidad."
  },
  aaa_large: {
    title: "WCAG AAA Large",
    description: "Estándar AAA para texto grande. Requiere un ratio de contraste de al menos 4.5:1.",
    details: "Estándar AAA para texto grande. Proporciona excelente legibilidad para usuarios con discapacidades visuales."
  },
  ui_graphic: {
    title: "WCAG UI/Graphic",
    description: "Estándar para elementos de interfaz gráfica. Requiere un ratio de contraste de al menos 3:1.",
    details: "Aplicable a iconos, botones, elementos de navegación y otros componentes de interfaz que no son principalmente texto."
  }
};

export default function WCAGTooltip({ children, standard }: WCAGTooltipProps) {
  const info = wcagInfo[standard];
  
  return (
    <Tooltip
      content={
        <div className="max-w-xs">
          <div className="font-semibold text-[var(--foreground)] mb-1">
            {info.title}
          </div>
          <div className="text-sm text-[var(--muted-foreground)] mb-2">
            {info.description}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {info.details}
          </div>
        </div>
      }
      position="top"
      delay={100}
    >
      {children}
    </Tooltip>
  );
}
