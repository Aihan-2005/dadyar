import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  "http://meabbaspour.endpointforge.ir:4000/dadyar";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  const url = `${API_BASE}/${path.join("/")}`;

  const response = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
    },
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.text(),
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ??
        "application/json",
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;