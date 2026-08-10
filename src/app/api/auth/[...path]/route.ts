import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedPaths = new Set([
  "login",
  "session",
  "change-password",
  "logout",
  "forgot-password",
  "reset-password",
  "create-password",
]);

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!allowedPaths.has(endpoint)) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return Response.json(
        { message: "Request origin is not allowed." },
        { status: 403 },
      );
    }
  }

  try {
    const requestBody =
      request.method === "GET" ? undefined : await request.text();
    const backendResponse = await fetch(
      `${backendUrl()}/api/auth/${endpoint}`,
      {
        method: request.method,
        headers: {
          accept: "application/json",
          ...(requestBody ? { "content-type": "application/json" } : {}),
          ...(request.headers.get("cookie")
            ? { cookie: request.headers.get("cookie")! }
            : {}),
          ...(request.headers.get("user-agent")
            ? { "user-agent": request.headers.get("user-agent")! }
            : {}),
        },
        cache: "no-store",
        body: requestBody || undefined,
      },
    );

    const headers = new Headers();
    const contentType = backendResponse.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const responseHeaders = backendResponse.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies =
      responseHeaders.getSetCookie?.() ??
      (backendResponse.headers.get("set-cookie")
        ? [backendResponse.headers.get("set-cookie")!]
        : []);
    for (const cookie of setCookies) headers.append("set-cookie", cookie);

    const hasNoResponseBody = [204, 205, 304].includes(backendResponse.status);
    const responseBody = hasNoResponseBody
      ? null
      : await backendResponse.arrayBuffer();

    return new Response(responseBody, {
      status: backendResponse.status,
      headers,
    });
  } catch {
    return Response.json(
      {
        message:
          "Authentication service is temporarily unavailable. Please try again.",
      },
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
