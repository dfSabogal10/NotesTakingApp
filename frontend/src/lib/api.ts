const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const REFRESH_PATH = "api/auth/refresh/";

function isRefreshPath(path: string): boolean {
  const normalized = path.replace(/^\//, "");
  return normalized === REFRESH_PATH || normalized.endsWith("/" + REFRESH_PATH);
}

async function doFetch<T>(
  path: string,
  options?: RequestInit,
  skipRefresh?: boolean
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      !skipRefresh &&
      !isRefreshPath(path)
    ) {
      const refreshResponse = await fetch(
        `${BASE_URL.replace(/\/$/, "")}/${REFRESH_PATH}`,
        { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } }
      );
      if (refreshResponse.ok) {
        return doFetch<T>(path, options, true);
      }
    }

    let message: string;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const data = await response.json();
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.join(" ")
              : data.message ?? JSON.stringify(data);
        message = detail || `Request failed with status ${response.status}`;
      } catch {
        message = `Request failed with status ${response.status}`;
      }
    } else {
      message = `Request failed with status ${response.status}`;
    }
    throw new Error(message);
  }

  const responseContentType = response.headers.get("content-type");
  if (responseContentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as unknown as T;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  return doFetch<T>(path, options);
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),

  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(path: string) =>
    apiFetch<T>(path, {
      method: "DELETE",
    }),
};
