import { NextResponse } from "next/server";
import { getBingDailyImage } from "@/lib/bing";

export async function GET() {
  const result = await getBingDailyImage();
  if (!result) {
    return NextResponse.json(null, { status: 500 });
  }
  return NextResponse.json({ url: result.url, copyright: result.copyright });
}
