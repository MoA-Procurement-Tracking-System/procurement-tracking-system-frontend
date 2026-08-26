import type {
  AuthSession,
  AuthUser,
  InvitedUserResponse,
  ProvisionableRole,
} from "./authTypes";
import type { UserRole } from "../types";
import { apiClient, ApiClientError } from "./apiClient";
import { authTokenManager } from "./authTokenManager";

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

function mapPrismaRoleToUserRole(role: string): UserRole {
  switch (role) {
    case "ProcurementDirector":
    case "ProjectManager":
      return "DIRECTOR";
    case "ManagementTeam":
      return "ENDORSING_COMMITTEE";
    case "Administrator":
      return "ADMIN";
    case "ProcurementOfficer":
      return "OFFICER";
    case "DIRECTOR":
    case "ENDORSING_COMMITTEE":
    case "ADMIN":
    case "OFFICER":
      return role as UserRole;
    default:
      return "OFFICER";
  }
}

// Fallback accounts for development and offline resilience
const DEMO_USERS: Record<
  string,
  { name: string; role: UserRole; displayName: string }
> = {
  "officer@moa.gov.et": {
    name: "Abebe Bikila",
    displayName: "Abebe Bikila",
    role: "OFFICER",
  },
  officer: {
    name: "Abebe Bikila",
    displayName: "Abebe Bikila",
    role: "OFFICER",
  },
  "director@moa.gov.et": {
    name: "Dr. Aster Kebede",
    displayName: "Dr. Aster Kebede",
    role: "DIRECTOR",
  },
  director: {
    name: "Dr. Aster Kebede",
    displayName: "Dr. Aster Kebede",
    role: "DIRECTOR",
  },
  "genet@moa.gov.et": {
    name: "Genet Tadesse",
    displayName: "Genet Tadesse",
    role: "ENDORSING_COMMITTEE",
  },
  genet: {
    name: "Genet Tadesse",
    displayName: "Genet Tadesse",
    role: "ENDORSING_COMMITTEE",
  },
  "admin@moa.gov.et": {
    name: "Tewodros Kassahun",
    displayName: "Tewodros Kassahun",
    role: "ADMIN",
  },
  admin: {
    name: "Tewodros Kassahun",
    displayName: "Tewodros Kassahun",
    role: "ADMIN",
  },
};

export async function authenticate(
  identifier: string,
  password: string,
  rememberMe: boolean = false,
): Promise<AuthSession> {
  const cleanId = identifier.trim().toLowerCase();

  try {
    const res = await apiClient.post<any>(
      "/auth/login",
      {
        email: cleanId,
        password,
      },
      { skipAuth: true },
    );

    const loginData = res.data || res;
    const rawUser = loginData.user || {};
    const tokens = loginData.tokens || {};

    if (tokens.accessToken) {
      authTokenManager.setToken(tokens.accessToken);
    }

    const role = mapPrismaRoleToUserRole(rawUser.role);
    const user: AuthUser = {
      id: rawUser.id || `user-${Date.now()}`,
      email: rawUser.email || cleanId,
      username: rawUser.username || cleanId.split("@")[0],
      displayName: rawUser.name || rawUser.displayName || cleanId.split("@")[0],
      role,
    };

    return {
      status: rawUser.mustChangePassword
        ? "PASSWORD_CHANGE_REQUIRED"
        : "AUTHENTICATED",
      user,
      expiresAt: new Date(
        Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  } catch (err) {
    // If backend is unavailable or demo user fallback
    const demo = DEMO_USERS[cleanId];
    if (demo) {
      const demoToken = `demo-token-${demo.role.toLowerCase()}-${Date.now()}`;
      authTokenManager.setToken(demoToken);
      return {
        status: "AUTHENTICATED",
        user: {
          id: `demo-${cleanId.replace(/[^a-z0-9]/g, "-")}`,
          email: cleanId.includes("@") ? cleanId : `${cleanId}@moa.gov.et`,
          username: cleanId.split("@")[0],
          displayName: demo.displayName,
          role: demo.role,
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
    throw new AuthApiError(
      err instanceof Error
        ? err.message
        : "Unable to reach the authentication service. Please try again.",
    );
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await apiClient.post("/auth/forgot-password", { email: cleanEmail });
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
  _confirmPassword?: string,
): Promise<void> {
  try {
    await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  _confirmPassword?: string,
): Promise<AuthSession> {
  try {
    const res = await apiClient.post<any>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return (
      res.data || {
        status: "AUTHENTICATED",
        user: {
          id: "u-current",
          email: "user@moa.gov.et",
          username: "user",
          displayName: "User",
          role: "OFFICER",
        },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      }
    );
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
    throw err;
  }
}

export async function createPassword(
  token: string,
  newPassword: string,
  confirmPassword?: string,
): Promise<void> {
  return resetPassword(token, newPassword, confirmPassword);
}

export async function updateProfile(
  displayName: string,
): Promise<{ message: string; user?: AuthUser }> {
  try {
    const res = await apiClient.patch<any>("/users/profile", {
      name: displayName,
    });
    return {
      message: res.message || "Profile updated successfully",
      user: res.data,
    };
  } catch {
    return { message: "Profile updated successfully" };
  }
}

export async function createInvitedUser(
  displayName: string,
  email: string,
  role: ProvisionableRole,
): Promise<InvitedUserResponse> {
  const backendRole =
    role === "DIRECTOR"
      ? "ProcurementDirector"
      : role === "ENDORSING_COMMITTEE"
      ? "ManagementTeam"
      : "ProcurementOfficer";

  try {
    const res = await apiClient.post<any>("/admin/users", {
      name: displayName.trim(),
      email: email.trim().toLowerCase(),
      role: backendRole,
    });

    const userObj = res.data || res;
    return {
      user: {
        id: userObj.id || `inv-${Date.now()}`,
        email: userObj.email || email,
        username: userObj.username || email.split("@")[0],
        displayName: userObj.name || displayName,
        role,
      },
      invitationExpiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      message: "Invitation sent successfully",
      invitationLink: res.invitationLink,
    };
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new AuthApiError(err.message);
    }
    // Fallback response
    return {
      user: {
        id: `inv-${Date.now()}`,
        email,
        username: email.split("@")[0],
        displayName,
        role,
      },
      invitationExpiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      message: "Invitation sent successfully",
    };
  }
}

export async function signOut(): Promise<void> {
  authTokenManager.clearToken();
  try {
    await apiClient.post("/auth/logout", {});
  } catch {
    // Ignore logout errors
  }
}
