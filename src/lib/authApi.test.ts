import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AuthApiError,
  authenticate,
  changePassword,
  createInvitedUser,
  createPassword,
  requestPasswordReset,
  signOut,
} from "./authApi";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("auth API", () => {
  it("normalizes the identifier and sends remember-me to the same-origin BFF", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "AUTHENTICATED",
          user: {
            id: "1",
            email: "officer@moa.gov.et",
            username: "officer",
            displayName: "Procurement Officer",
            role: "OFFICER",
          },
          expiresAt: new Date().toISOString(),
        }),
        { status: 200 },
      ),
    );

    const session = await authenticate(" Officer ", "secret", true);

    expect(session.user.role).toBe("OFFICER");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({
          identifier: "officer",
          password: "secret",
          rememberMe: true,
        }),
      }),
    );
  });

  it("surfaces the backend's generic sign-in error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Unable to sign in with those credentials.",
        }),
        { status: 401 },
      ),
    );

    await expect(authenticate("unknown", "wrong", false)).rejects.toEqual(
      new AuthApiError("Unable to sign in with those credentials."),
    );
  });

  it("uses the password lifecycle endpoints without returning browser tokens", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await requestPasswordReset(" Officer@MOA.GOV.ET ");
    await signOut();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/forgot-password",
      expect.objectContaining({
        body: JSON.stringify({ email: "officer@moa.gov.et" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/logout",
      expect.objectContaining({ body: "{}" }),
    );
  });

  it("submits all fields required to replace a temporary password", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "AUTHENTICATED",
          user: {
            id: "1",
            email: "director@moa.gov.et",
            username: null,
            displayName: "Director",
            role: "DIRECTOR",
          },
          expiresAt: new Date().toISOString(),
        }),
        { status: 200 },
      ),
    );

    await changePassword("Temporary1!", "New-Password2!", "New-Password2!");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/change-password",
      expect.objectContaining({
        body: JSON.stringify({
          currentPassword: "Temporary1!",
          newPassword: "New-Password2!",
          confirmPassword: "New-Password2!",
        }),
      }),
    );
  });

  it("creates an invited user's password without a current password", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Password created." }), {
        status: 200,
      }),
    );

    await createPassword(
      "invitation-token",
      "New-Password2!",
      "New-Password2!",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/create-password",
      expect.objectContaining({
        body: JSON.stringify({
          token: "invitation-token",
          newPassword: "New-Password2!",
          confirmPassword: "New-Password2!",
        }),
      }),
    );
  });

  it("provisions a non-admin user with name, email and role only", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: "2",
            email: "officer@moa.gov.et",
            username: null,
            displayName: "Procurement Officer",
            role: "OFFICER",
          },
          invitationExpiresAt: new Date().toISOString(),
          message: "Invitation sent.",
        }),
        { status: 201 },
      ),
    );

    await createInvitedUser(
      " Procurement Officer ",
      " Officer@MOA.GOV.ET ",
      "OFFICER",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/users",
      expect.objectContaining({
        body: JSON.stringify({
          displayName: "Procurement Officer",
          email: "officer@moa.gov.et",
          role: "OFFICER",
        }),
      }),
    );
  });
});
