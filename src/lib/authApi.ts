export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  payload: unknown;
}

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

const DEFAULT_LOGIN_PATH = "/Auth/login";
const DEFAULT_PASSWORD_RESET_PATH = "/Auth/forgot-password";

function getApiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!baseUrl) {
    throw new AuthApiError(
      "Authentication service is not configured. Contact technical support.",
    );
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function getStringProperty(
  value: unknown,
  propertyNames: string[],
): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  for (const propertyName of propertyNames) {
    const propertyValue = record[propertyName];
    if (typeof propertyValue === "string" && propertyValue.trim()) {
      return propertyValue;
    }
  }

  return getStringProperty(record.data, propertyNames);
}

async function readResponseBody(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return responseText;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return (
    getStringProperty(payload, ["message", "detail", "title", "error"]) ??
    fallback
  );
}

async function postJson(path: string, body: object): Promise<unknown> {
  const url = getApiUrl(path);
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthApiError(
      "Unable to reach the authentication service. Please try again.",
    );
  }

  const payload = await readResponseBody(response);

  if (!response.ok) {
    throw new AuthApiError(
      getErrorMessage(
        payload,
        "The request could not be completed. Please check your details and try again.",
      ),
    );
  }

  return payload;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<AuthSession> {
  const payload = await postJson(
    process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? DEFAULT_LOGIN_PATH,
    {
      email: email.trim().toLowerCase(),
      password,
    },
  );

  return {
    accessToken: getStringProperty(payload, [
      "accessToken",
      "access_token",
      "token",
      "jwt",
    ]),
    refreshToken: getStringProperty(payload, ["refreshToken", "refresh_token"]),
    payload,
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  await postJson(
    process.env.NEXT_PUBLIC_AUTH_PASSWORD_RESET_PATH ??
      DEFAULT_PASSWORD_RESET_PATH,
    { email: email.trim().toLowerCase() },
  );
}
