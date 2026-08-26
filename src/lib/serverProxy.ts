import type { NextRequest } from "next/server";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 15_000;

export function extractJwtFromCookies(cookieHeader: string): string | null {
  const cookiesList = cookieHeader.split(";");
  for (const cookie of cookiesList) {
    const parts = cookie.trim().split("=");
    const name = parts[0];
    const value = parts.slice(1).join("=");
    if (
      value &&
      (value.startsWith("eyJ") ||
        name.toLowerCase().includes("token") ||
        name.toLowerCase().includes("session"))
    ) {
      return value;
    }
  }
  return null;
}

export async function proxyToBackend(
  request: NextRequest,
  basePath: string,
  subPath?: string[],
) {
  const endpoint = subPath && subPath.length > 0 ? subPath.join("/") : "";
  const targetPath = endpoint ? `${basePath}/${endpoint}` : basePath;
  const targetUrl = `${backendUrl()}/api/${targetPath}${request.nextUrl.search}`;

  const cookieHeader = request.headers.get("cookie") || "";
  const authHeader = request.headers.get("authorization");
  const token =
    authHeader?.replace(/^Bearer\s+/i, "") ||
    extractJwtFromCookies(cookieHeader);

  const headers = new Headers();
  headers.set("accept", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();
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
    console.error(`Backend Proxy Error for ${targetUrl}:`, error);
    return Response.json(
      { message: `Service is temporarily unavailable.` },
      { status: 503 },
    );
  }
}
