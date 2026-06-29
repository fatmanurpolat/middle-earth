import type {
  ApiErrorBody,
  AuthResponse,
  Book,
  ChangePasswordRequest,
  Character,
  LoginRequest,
  MeResponse,
  ProfileResponse,
  ProgressResponse,
  RegisterRequest,
  UpdateProfileRequest,
  UpdateProgressRequest,
  BookId,
} from '@middleearth/shared';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(
  /\/+$/,
  '',
);

/** Token getter so the client always reads the freshest token from the auth layer. */
export type TokenGetter = () => string | null;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const maybe = value as { error?: unknown };
  if (typeof maybe.error !== 'object' || maybe.error === null) return false;
  const err = maybe.error as { code?: unknown; message?: unknown };
  return typeof err.code === 'string' && typeof err.message === 'string';
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken: TokenGetter;

  constructor(getToken: TokenGetter, baseUrl: string = API_URL) {
    this.getToken = getToken;
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, auth = false, signal } = options;
    const headers: Record<string, string> = {};

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (cause) {
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        cause instanceof Error ? cause.message : 'Network request failed',
        cause,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    let payload: unknown = null;
    const text = await response.text();
    if (text.length > 0) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      if (isApiErrorBody(payload)) {
        throw new ApiError(
          response.status,
          payload.error.code,
          payload.error.message,
          payload.error.details,
        );
      }
      throw new ApiError(
        response.status,
        'HTTP_ERROR',
        `Request failed with status ${response.status}`,
      );
    }

    return payload as T;
  }

  // ---- Public catalog ----
  getCharacters(signal?: AbortSignal): Promise<Character[]> {
    return this.request<Character[]>('/characters', { signal });
  }

  getBooks(signal?: AbortSignal): Promise<Book[]> {
    return this.request<Book[]>('/books', { signal });
  }

  // ---- Auth ----
  register(input: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      signal,
    });
  }

  login(input: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
      signal,
    });
  }

  logout(signal?: AbortSignal): Promise<void> {
    return this.request<void>('/auth/session', {
      method: 'DELETE',
      auth: true,
      signal,
    });
  }

  // ---- Authenticated user ----
  getMe(signal?: AbortSignal): Promise<MeResponse> {
    return this.request<MeResponse>('/me', { auth: true, signal });
  }

  updateProfile(
    input: UpdateProfileRequest,
    signal?: AbortSignal,
  ): Promise<ProfileResponse> {
    return this.request<ProfileResponse>('/me', {
      method: 'PATCH',
      body: input,
      auth: true,
      signal,
    });
  }

  changePassword(input: ChangePasswordRequest, signal?: AbortSignal): Promise<void> {
    return this.request<void>('/me/password', {
      method: 'PATCH',
      body: input,
      auth: true,
      signal,
    });
  }

  /** Upload a new avatar image (multipart/form-data, field name "file"). */
  async uploadAvatar(file: File, signal?: AbortSignal): Promise<ProfileResponse> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const form = new FormData();
    form.append('file', file);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/me/avatar`, {
        method: 'POST',
        headers, // do NOT set Content-Type; the browser adds the multipart boundary
        body: form,
        signal,
      });
    } catch (cause) {
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        cause instanceof Error ? cause.message : 'Network request failed',
        cause,
      );
    }

    let payload: unknown = null;
    const text = await response.text();
    if (text.length > 0) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = null;
      }
    }
    if (!response.ok) {
      if (isApiErrorBody(payload)) {
        throw new ApiError(
          response.status,
          payload.error.code,
          payload.error.message,
          payload.error.details,
        );
      }
      throw new ApiError(
        response.status,
        'HTTP_ERROR',
        `Request failed with status ${response.status}`,
      );
    }
    return payload as ProfileResponse;
  }

  getProgress(signal?: AbortSignal): Promise<ProgressResponse> {
    return this.request<ProgressResponse>('/books/progress', {
      auth: true,
      signal,
    });
  }

  setBookProgress(
    bookId: BookId,
    input: UpdateProgressRequest,
    signal?: AbortSignal,
  ): Promise<ProgressResponse> {
    return this.request<ProgressResponse>(
      `/books/${encodeURIComponent(bookId)}/progress`,
      {
        method: 'PUT',
        body: input,
        auth: true,
        signal,
      },
    );
  }
}
