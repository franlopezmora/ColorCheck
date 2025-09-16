import { NextRequest, NextResponse } from "next/server";
import { accessiblePairs } from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const { palette, threshold = "aa_normal", limit = 50 } = await req.json();
    if (!Array.isArray(palette) || palette.length < 2) {
      return NextResponse.json({ ok:false, error:"palette must be an array of >=2 colors" }, { status:400 });
    }
    const { pairs } = accessiblePairs(palette, threshold);
    return NextResponse.json({ ok:true, threshold, pairs: pairs.slice(0, Math.min(200, limit)) });
  } catch (e: unknown) {
    return NextResponse.json({ ok:false, error: e instanceof Error ? e.message : "invalid payload" }, { status:400 });
  }
}
