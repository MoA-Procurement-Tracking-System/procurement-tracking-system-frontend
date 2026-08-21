import type {
  AuthSession,
  AuthUser,
  InvitedUserResponse,
  ProvisionableRole,
} from "./authTypes";

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

async function apiRequest<T>(
  path: string,
  body?: object,
  method?: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: method || (body ? "POST" : "GET"),
      headers: body ? { "Content-Type": "application/json" } : undefined,
      credentials: "same-origin",
      cache: "no-store",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthApiError(
      "Unable to reach the authentication service. Please try again.",
    );
  }

  const payload = await readResponseBody(response);
  if (!response.ok) {
    throw new AuthApiError(
      errorMessage(payload, "The request could not be completed."),
    );
  }
  return payload as T;
}

function authRequest<T>(
  path: string,
  body?: object,
  method?: string,
): Promise<T> {
  return apiRequest<T>(`/api/auth/${path}`, body, method);
}

export function authenticate(
  identifier: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthSession> {
  return authRequest<AuthSession>("login", {
    identifier: identifier.trim().toLowerCase(),
    password,
    rememberMe,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await authRequest<{ message: string }>("forgot-password", {
    email: email.trim().toLowerCase(),
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<AuthSession> {
  return authRequest<AuthSession>("change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
}

export function updateProfile(
  displayName: string,
): Promise<{ message: string; user?: AuthUser }> {
  return authRequest<{ message: string; user?: AuthUser }>(
    "profile",
    { displayName },
    "PATCH",
  );
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  await authRequest<{ message: string }>("reset-password", {
    token,
    newPassword,
    confirmPassword,
  });
}

export async function createPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  await authRequest<{ message: string }>("create-password", {
    token,
    newPassword,
    confirmPassword,
  });
}

export function createInvitedUser(
  displayName: string,
  email: string,
  role: ProvisionableRole,
): Promise<InvitedUserResponse> {
  return apiRequest<InvitedUserResponse>("/api/admin/users", {
    displayName: displayName.trim(),
    email: email.trim().toLowerCase(),
    role,
  });
}

export async function signOut(): Promise<void> {
  await authRequest<void>("logout", {});
}
