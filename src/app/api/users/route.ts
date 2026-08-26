import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendUrl = () =>
  (process.env.BACKEND_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
const BACKEND_TIMEOUT_MS = 15_000;

export async function GET(request: NextRequest) {
  try {
    const queryString = request.nextUrl.search;
    const backendResponse = await fetch(
      `${backendUrl()}/api/users${queryString}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(request.headers.get("cookie")
            ? { cookie: request.headers.get("cookie")! }
            : {}),
        },
        cache: "no-store",
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
