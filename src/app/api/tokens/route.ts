import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { palette } = await req.json();
  if (!palette || typeof palette !== "object") {
    return NextResponse.json({ ok:false, error:"palette must be an object of name -> hex" }, { status:400 });
  }
  const entries = Object.entries(palette) as [string,string][];
  const css = `:root{${entries.map(([k,v])=>`--color-${k}:${v}`).join(";")}}`;
  const json = { color: Object.fromEntries(entries.map(([k,v])=>[k,{ value:v }])) };
  const tailwind = { theme: { extend: { colors: Object.fromEntries(entries) } } };
  return NextResponse.json({ css, json, tailwind });
}
