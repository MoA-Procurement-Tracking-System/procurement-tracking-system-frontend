import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 15_000;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const origin = request.headers.get("origin");
  const expectedOrigin =
    process.env.APP_ORIGIN?.replace(/\/$/, "") ?? request.nextUrl.origin;
  if (origin && origin !== expectedOrigin) {
    return Response.json(
      { message: "Request origin is not allowed." },
      { status: 403 },
    );
  }

  try {
    const requestBody = await request.text();
    const backendResponse = await fetch(
      `${backendUrl()}/api/users/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          ...(request.headers.get("cookie")
            ? { cookie: request.headers.get("cookie")! }
            : {}),
        },
        cache: "no-store",
        body: requestBody,
        signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
      },
    );

    const contentType = backendResponse.headers.get("content-type");
    const responseBody = await backendResponse.arrayBuffer();

    return new Response(responseBody, {
      status: backendResponse.status,
      headers: contentType ? { "content-type": contentType } : undefined,
    });
  } catch {
    return Response.json(
      { message: "User service is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
