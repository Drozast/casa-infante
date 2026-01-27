import { useAuthStore } from '../auth-store';

const mockUser = {
  id: 'user-1',
  email: 'test@example.cl',
  firstName: 'Maria',
  lastName: 'Gonzalez',
  role: 'GUARDIAN' as const,
};

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth correctly', () => {
    useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should update tokens without changing user', () => {
    useAuthStore.getState().setAuth(mockUser, 'old-access', 'old-refresh');
    useAuthStore.getState().setTokens('new-access', 'new-refresh');
    const state = useAuthStore.getState();

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear state on logout', () => {
    useAuthStore.getState().setAuth(mockUser, 'access', 'refresh');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set hydrated flag', () => {
    useAuthStore.getState().setHydrated();
    expect(useAuthStore.getState().isHydrated).toBe(true);
  });
});
