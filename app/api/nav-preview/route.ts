import { NextResponse } from "next/server";

import { getNavPreview } from "@/lib/products";

/** Feeds the Header's hover-flyout menu (subcategory links + product previews). */
export async function GET() {
  const data = await getNavPreview();
  return NextResponse.json(data);
}
