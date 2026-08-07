import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthApiError, authenticate, requestPasswordReset } from "./authApi";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("auth API", () => {
  it("normalizes the email and reads tokens from a successful login", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test/api/");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            accessToken: "access-token",
            refreshToken: "refresh-token",
          },
        }),
        { status: 200 },
      ),
    );

    const session = await authenticate(" Officer@MOA.GOV.ET ", "secret");

    expect(session.accessToken).toBe("access-token");
    expect(session.refreshToken).toBe("refresh-token");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/Auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: "officer@moa.gov.et",
          password: "secret",
        }),
      }),
    );
  });

  it("surfaces a useful API error message", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test/api");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid email or password." }), {
        status: 401,
      }),
    );

    await expect(authenticate("officer@moa.gov.et", "wrong")).rejects.toThrow(
      "Invalid email or password.",
    );
  });

  it("uses the configured password-reset endpoint", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test/api");
    vi.stubEnv(
      "NEXT_PUBLIC_AUTH_PASSWORD_RESET_PATH",
      "/Account/request-reset",
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await requestPasswordReset(" Officer@MOA.GOV.ET ");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/Account/request-reset",
      expect.objectContaining({
        body: JSON.stringify({ email: "officer@moa.gov.et" }),
      }),
    );
  });

  it("fails clearly when the API URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");

    await expect(authenticate("officer@moa.gov.et", "secret")).rejects.toEqual(
      new AuthApiError(
        "Authentication service is not configured. Contact technical support.",
      ),
    );
  });
});
