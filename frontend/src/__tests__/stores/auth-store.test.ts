import { act } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth-store';

describe('useAuthStore', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    role: 'GUARDIAN' as const,
    phone: '+56912345678',
  };

  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isHydrated: false,
      });
    });
  });

  describe('initial state', () => {
    it('should have null user and tokens', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('should set user, tokens and isAuthenticated to true', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockAccessToken);
      expect(state.refreshToken).toBe(mockRefreshToken);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setTokens', () => {
    it('should update tokens without modifying user', () => {
      // First set auth
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Then update tokens
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      act(() => {
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
      });

      const state = useAuthStore.getState();

      expect(state.accessToken).toBe(newAccessToken);
      expect(state.refreshToken).toBe(newRefreshToken);
      expect(state.user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear all auth state', () => {
      // First set auth
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      // Then logout
      act(() => {
        useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setHydrated', () => {
    it('should set isHydrated to true', () => {
      expect(useAuthStore.getState().isHydrated).toBe(false);

      act(() => {
        useAuthStore.getState().setHydrated();
      });

      expect(useAuthStore.getState().isHydrated).toBe(true);
    });
  });

  describe('user roles', () => {
    it('should handle ADMIN role', () => {
      const adminUser = { ...mockUser, role: 'ADMIN' as const };

      act(() => {
        useAuthStore.getState().setAuth(adminUser, mockAccessToken, mockRefreshToken);
      });

      expect(useAuthStore.getState().user?.role).toBe('ADMIN');
    });

    it('should handle STAFF role', () => {
      const staffUser = { ...mockUser, role: 'STAFF' as const };

      act(() => {
        useAuthStore.getState().setAuth(staffUser, mockAccessToken, mockRefreshToken);
      });

      expect(useAuthStore.getState().user?.role).toBe('STAFF');
    });

    it('should handle GUARDIAN role', () => {
      act(() => {
        useAuthStore.getState().setAuth(mockUser, mockAccessToken, mockRefreshToken);
      });

      expect(useAuthStore.getState().user?.role).toBe('GUARDIAN');
    });
  });

  describe('optional user fields', () => {
    it('should handle user with profession', () => {
      const userWithProfession = { ...mockUser, profession: 'Ingeniero' };

      act(() => {
        useAuthStore.getState().setAuth(userWithProfession, mockAccessToken, mockRefreshToken);
      });

      expect(useAuthStore.getState().user?.profession).toBe('Ingeniero');
    });

    it('should handle user with shareProfile', () => {
      const userWithShareProfile = { ...mockUser, shareProfile: true };

      act(() => {
        useAuthStore.getState().setAuth(userWithShareProfile, mockAccessToken, mockRefreshToken);
      });

      expect(useAuthStore.getState().user?.shareProfile).toBe(true);
    });
  });
});
