import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 15_000;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return Response.json(
      { message: "Request origin is not allowed." },
      { status: 403 },
    );
  }

  try {
    const requestBody = await request.text();
    const backendResponse = await fetch(`${backendUrl()}/api/admin/users`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...(request.headers.get("cookie")
          ? { cookie: request.headers.get("cookie")! }
          : {}),
        ...(request.headers.get("user-agent")
          ? { "user-agent": request.headers.get("user-agent")! }
          : {}),
      },
      cache: "no-store",
      body: requestBody,
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    const contentType = backendResponse.headers.get("content-type");
    const hasNoResponseBody = [204, 205, 304].includes(backendResponse.status);
    const responseBody = hasNoResponseBody
      ? null
      : await backendResponse.arrayBuffer();

    return new Response(responseBody, {
      status: backendResponse.status,
      headers: contentType ? { "content-type": contentType } : undefined,
    });
  } catch {
    return Response.json(
      {
        message:
          "User administration service is temporarily unavailable. Please try again.",
      },
      { status: 503 },
    );
  }
}
