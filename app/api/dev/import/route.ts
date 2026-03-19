import { getImportLogs } from "@/lib/queries/import-logs";
import { handleFetchImport, handleZipImport } from "@/lib/import/web-handler";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const logs = await getImportLogs();
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      if (!file.name.endsWith(".zip")) {
        return NextResponse.json(
          { error: "File must be a .zip" },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const result = await handleZipImport(buffer);
      return NextResponse.json(result, { status: 201 });
    }

    const body = await request.json();
    if (body.source === "fetch") {
      const result = await handleFetchImport();
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
