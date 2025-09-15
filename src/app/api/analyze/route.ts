import { NextRequest, NextResponse } from "next/server";
import { analyzePalette } from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const { palette, options } = await req.json();
    if (!Array.isArray(palette) || palette.length < 2) {
      return NextResponse.json({ ok:false, error:"palette must be an array of >=2 colors" }, { status:400 });
    }
    return NextResponse.json(analyzePalette(palette, options));
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e.message ?? "invalid payload" }, { status:400 });
  }
}
