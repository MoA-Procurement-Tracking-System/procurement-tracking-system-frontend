import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 15_000;

type RouteContext = { params: Promise<{ path?: string[] }> };

function extractJwtFromCookies(cookieHeader: string): string | null {
  const cookiesList = cookieHeader.split(";");
  for (const cookie of cookiesList) {
    const [_, value] = cookie.trim().split("=");
    if (value && value.startsWith("eyJ")) {
      return value;
    }
  }
  return null;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const endpoint = path ? path.join("/") : "";
  const targetUrl = `${backendUrl()}/api/plans/${endpoint}${request.nextUrl.search}`;

  const cookieHeader = request.headers.get("cookie") || "";
  const token = extractJwtFromCookies(cookieHeader);

  const headers = new Headers();
  headers.set("accept", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const requestBody =
    request.method === "GET" ? undefined : await request.text();
  if (requestBody) {
    headers.set("content-type", "application/json");
  }

  try {
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      cache: "no-store",
      body: requestBody || undefined,
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    const contentType = backendResponse.headers.get("content-type");
    const responseHeaders = new Headers();
    if (contentType) responseHeaders.set("content-type", contentType);

    const hasNoResponseBody = [204, 205, 304].includes(backendResponse.status);
    const responseBody = hasNoResponseBody
      ? null
      : await backendResponse.arrayBuffer();

    return new Response(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Plans Proxy error:", error);
    return Response.json(
      { message: "Plans service is temporarily unavailable." },
      { status: 503 },
    );
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}
