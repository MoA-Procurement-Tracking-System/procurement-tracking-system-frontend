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
  it("normalizes the identifier and sends login directly to the backend", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            user: {
              id: "1",
              email: "custom-officer@moa.gov.et",
              name: "Procurement Officer",
              role: "ProcurementOfficer",
            },
            tokens: {
              accessToken: "sample-token",
            },
          },
        }),
        { status: 200 },
      ),
    );

    const session = await authenticate(" custom-officer@moa.gov.et ", "secret", true);

    expect(session.user.role).toBe("OFFICER");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: "custom-officer@moa.gov.et",
          password: "secret",
        }),
      }),
    );
  });

  it("surfaces the backend sign-in error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Unable to sign in with those credentials.",
        }),
        { status: 401 },
      ),
    );

    await expect(authenticate("unknown@domain.com", "wrong", false)).rejects.toEqual(
      new AuthApiError("Unable to sign in with those credentials."),
    );
  });

  it("uses the password lifecycle endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await requestPasswordReset(" custom-user@moa.gov.et ");
    await signOut();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/auth/forgot-password"),
      expect.objectContaining({
        body: JSON.stringify({ email: "custom-user@moa.gov.et" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/auth/logout"),
      expect.any(Object),
    );
  });

  it("submits password reset and change fields", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            user: {
              id: "1",
              email: "director@moa.gov.et",
              name: "Director",
              role: "ProcurementDirector",
            },
          },
        }),
        { status: 200 },
      ),
    );

    await changePassword("Temporary1!", "New-Password2!", "New-Password2!");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/change-password"),
      expect.objectContaining({
        body: JSON.stringify({
          currentPassword: "Temporary1!",
          newPassword: "New-Password2!",
        }),
      }),
    );
  });

  it("creates an invited user's password", async () => {
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
      expect.stringContaining("/auth/reset-password"),
      expect.objectContaining({
        body: JSON.stringify({
          token: "invitation-token",
          newPassword: "New-Password2!",
        }),
      }),
    );
  });

  it("provisions a non-admin user with name, email and role", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "2",
            email: "officer-new@moa.gov.et",
            name: "Procurement Officer",
            role: "ProcurementOfficer",
          },
          invitationExpiresAt: new Date().toISOString(),
          message: "Invitation sent successfully",
        }),
        { status: 201 },
      ),
    );

    await createInvitedUser(
      " Procurement Officer ",
      " Officer-New@MOA.GOV.ET ",
      "OFFICER",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/admin/users"),
      expect.objectContaining({
        body: JSON.stringify({
          name: "Procurement Officer",
          email: "officer-new@moa.gov.et",
          role: "ProcurementOfficer",
        }),
      }),
    );
  });

  it("uses the backend enum when provisioning an endorsing committee user", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "3",
            email: "committee@moa.gov.et",
            name: "Committee Member",
            role: "ManagementTeam",
          },
          invitationExpiresAt: new Date().toISOString(),
          message: "Invitation sent successfully",
        }),
        { status: 201 },
      ),
    );

    await createInvitedUser(
      "Committee Member",
      "committee@moa.gov.et",
      "ENDORSING_COMMITTEE",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/admin/users"),
      expect.objectContaining({
        body: JSON.stringify({
          name: "Committee Member",
          email: "committee@moa.gov.et",
          role: "ManagementTeam",
        }),
      }),
    );
  });
});
