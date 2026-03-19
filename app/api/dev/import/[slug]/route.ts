import { getImportBySlug } from "@/lib/queries/import-logs";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const { slug } = await params;
  const importLog = await getImportBySlug(slug);

  if (!importLog) {
    return NextResponse.json({ error: "Import not found" }, { status: 404 });
  }

  return NextResponse.json(importLog);
}
