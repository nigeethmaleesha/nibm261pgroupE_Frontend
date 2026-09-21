const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

let refreshPromise: Promise<Response> | null = null;
let sessionExpiredDispatched = false;

function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;
    if (typeof value.message === "string" && value.message.trim()) return value.message;
    if (typeof value.error === "string" && value.error.trim()) return value.error;
  }

  if (typeof data === "string" && data.trim()) return data;
  return fallback;
}

function notifySessionExpired() {
  if (typeof window === "undefined" || sessionExpiredDispatched) return;
  sessionExpiredDispatched = true;
  window.dispatchEvent(new Event("repairflow-session-expired"));
}

export function markSessionHealthy() {
  sessionExpiredDispatched = false;
}

async function performRefresh() {
  return fetch(apiUrl("/auth/refresh-token"), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

type RequestOptions = {
  skipRefresh?: boolean;
};

async function requestRaw(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
  retryAllowed = true,
): Promise<Response> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (
    options.skipRefresh ||
    !retryAllowed ||
    response.status !== 401 ||
    path === "/auth/refresh-token"
  ) {
    return response;
  }

  const refreshed = await refreshSession();

  if (refreshed.ok) {
    markSessionHealthy();
    return requestRaw(path, init, options, false);
  }

  if (refreshed.status === 401 || refreshed.status === 403) {
    notifySessionExpired();
  }

  return response;
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  try {
    const response = await requestRaw(path, init, options);
    const data = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(
        errorMessage(data, `Request failed with status ${response.status}.`),
        response.status,
        data,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      error instanceof Error ? error.message : "Unable to connect to the server.",
      0,
    );
  }
}

export async function logoutRequest() {
  try {
    const response = await fetch(apiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
