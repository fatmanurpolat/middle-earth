import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AuthResponse,
  BookProgressDTO,
  FanMeterResult,
  LoginRequest,
  ProgressResponse,
  RegisterRequest,
  UserDTO,
} from '@middleearth/shared';
import { ApiClient, ApiError } from '../api/client';

const TOKEN_STORAGE_KEY = 'me_token';

export type AuthStatus = 'loading' | 'guest' | 'authed';

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: UserDTO | null;
  progress: BookProgressDTO[];
  fanMeter: FanMeterResult | null;
}

export interface AuthContextValue extends AuthState {
  api: ApiClient;
  register: (input: RegisterRequest) => Promise<void>;
  login: (input: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Reconcile a fresh progress + fanMeter payload after a mutation. */
  applyProgress: (payload: ProgressResponse) => void;
  /** Replace the user + fanMeter after a profile update. */
  applyUser: (user: UserDTO, fanMeter: FanMeterResult) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* storage unavailable — keep in-memory state only */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    token: readStoredToken(),
    user: null,
    progress: [],
    fanMeter: null,
  });

  // Keep a live ref so the ApiClient token getter never goes stale.
  const tokenRef = useRef<string | null>(state.token);
  tokenRef.current = state.token;

  const api = useMemo(() => new ApiClient(() => tokenRef.current), []);

  const setToken = useCallback((token: string | null) => {
    tokenRef.current = token;
    writeStoredToken(token);
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setState({
      status: 'guest',
      token: null,
      user: null,
      progress: [],
      fanMeter: null,
    });
  }, [setToken]);

  const hydrate = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      const token = tokenRef.current;
      if (!token) {
        setState((prev) => ({ ...prev, status: 'guest' }));
        return;
      }
      try {
        const me = await api.getMe(signal);
        setState({
          status: 'authed',
          token,
          user: me.user,
          progress: me.progress,
          fanMeter: me.fanMeter,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return;
        }
        // Network or server error: surface as guest so the door is reachable,
        // but keep the token so a manual retry can re-hydrate.
        setState((prev) => ({ ...prev, status: 'guest' }));
      }
    },
    [api, clearSession],
  );

  useEffect(() => {
    const controller = new AbortController();
    void hydrate(controller.signal);
    return () => controller.abort();
  }, [hydrate]);

  const completeAuth = useCallback(
    async (response: AuthResponse): Promise<void> => {
      setToken(response.token);
      // Pull the full /me payload so progress + fanMeter are populated.
      try {
        const me = await api.getMe();
        setState({
          status: 'authed',
          token: response.token,
          user: me.user,
          progress: me.progress,
          fanMeter: me.fanMeter,
        });
      } catch {
        // Fall back to the auth payload if /me hiccups; progress fills on refresh.
        setState({
          status: 'authed',
          token: response.token,
          user: response.user,
          progress: [],
          fanMeter: null,
        });
      }
    },
    [api, setToken],
  );

  const register = useCallback(
    async (input: RegisterRequest): Promise<void> => {
      await completeAuth(await api.register(input));
    },
    [api, completeAuth],
  );

  const login = useCallback(
    async (input: LoginRequest): Promise<void> => {
      await completeAuth(await api.login(input));
    },
    [api, completeAuth],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.logout();
    } catch {
      /* best-effort revoke — clear locally regardless */
    } finally {
      clearSession();
    }
  }, [api, clearSession]);

  const refresh = useCallback(async (): Promise<void> => {
    await hydrate();
  }, [hydrate]);

  const applyProgress = useCallback((payload: ProgressResponse): void => {
    setState((prev) => ({
      ...prev,
      progress: payload.progress,
      fanMeter: payload.fanMeter,
    }));
  }, []);

  const applyUser = useCallback(
    (user: UserDTO, fanMeter: FanMeterResult): void => {
      setState((prev) => ({ ...prev, user, fanMeter }));
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      api,
      register,
      login,
      logout,
      refresh,
      applyProgress,
      applyUser,
    }),
    [state, api, register, login, logout, refresh, applyProgress, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
