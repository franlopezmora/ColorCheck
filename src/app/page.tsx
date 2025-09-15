"use client";
import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("#0EA5E9\n#111827\n#F9FAFB\n#F97316");
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function onAnalyze() {
    setLoading(true);
    const palette = input.split(/\s+/).filter(Boolean);
    const res = await fetch("/api/pairs", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ palette, threshold: "aa_normal" })
    });
    const json = await res.json();
    setPairs(json.pairs ?? []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white text-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">ColorCheck</h1>
        <p className="opacity-80">Pegá tus colores (HEX) y encontrá pares accesibles AA/AAA.</p>

        <textarea
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          className="w-full h-32 p-3 rounded-xl border"
        />
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          {loading ? "Analizando..." : "Analizar"}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pairs.map((p, i) => (
            <div key={i} className="rounded-xl overflow-hidden border">
              <div className="p-6" style={{ color: p.fg, background: p.bg }}>
                <div className="text-2xl font-bold">Aa</div>
                <div className="text-sm opacity-80">{p.fg} on {p.bg}</div>
              </div>
              <div className="p-3 text-sm flex items-center justify-between">
                <span>Contraste: {p.ratio}</span>
                <span className="opacity-70">{p.passes.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
