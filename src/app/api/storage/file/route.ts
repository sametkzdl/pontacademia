import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/services/storage.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const key = searchParams.get("key");

  if (!key) {
    return new NextResponse("Key parameter missing", { status: 400 });
  }

  try {
    const file = await StorageService.getFile(key);

    if (!file || !file.body) {
      return new NextResponse("File not found", { status: 404 });
    }

    return new NextResponse(file.body as any, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(file.contentLength ? { "Content-Length": String(file.contentLength) } : {}),
        ...(file.etag ? { ETag: file.etag } : {}),
      },
    });
  } catch (err) {
    console.error("[Storage Proxy Error]:", err);
    return new NextResponse("Error fetching file", { status: 500 });
  }
}
