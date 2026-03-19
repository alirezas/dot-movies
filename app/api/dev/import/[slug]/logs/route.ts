import {
  getImportBySlug,
  getImportLogEntries,
} from "@/lib/queries/import-logs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
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

  const afterParam = request.nextUrl.searchParams.get("after");
  const afterId = afterParam ? parseInt(afterParam, 10) : undefined;

  const entries = await getImportLogEntries(importLog.id, afterId);

  return NextResponse.json({ importLog, entries });
}
