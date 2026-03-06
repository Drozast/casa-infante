import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Prevent multiple simultaneous refresh requests
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      logout();
      return null;
    }

    const data = await response.json();
    const wrapped = data as { success?: boolean; data?: { accessToken: string; refreshToken: string } };

    if (wrapped?.success && wrapped.data) {
      setTokens(wrapped.data.accessToken, wrapped.data.refreshToken);
      return wrapped.data.accessToken;
    }

    logout();
    return null;
  } catch {
    logout();
    return null;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new ApiError('Error de conexion. Verifica tu internet.', 0);
  }

  // On 401, try to refresh the token and retry once
  if (response.status === 401 && token) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      // Retry the original request with the new token
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      };

      try {
        response = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers: retryHeaders,
        });
      } catch {
        throw new ApiError('Error de conexion. Verifica tu internet.', 0);
      }
    }
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Error del servidor (${response.status})`,
        response.status
      );
    }
    throw new ApiError('Respuesta invalida del servidor', response.status);
  }

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new ApiError(
      errorData.message || 'Error en la solicitud',
      response.status,
      data
    );
  }

  // Unwrap { success, data, meta } envelope from backend
  const wrapped = data as { success?: boolean; data?: unknown; meta?: unknown };
  if (wrapped && typeof wrapped === 'object' && 'success' in wrapped && 'data' in wrapped) {
    if ('meta' in wrapped) {
      return { data: wrapped.data, meta: wrapped.meta } as T;
    }
    return wrapped.data as T;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE', token }),
};

export { ApiError };
