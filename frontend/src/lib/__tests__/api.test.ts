import { api, ApiError } from '../api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031/api/v1';

// Mock the auth store
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: () => ({
      refreshToken: null,
      setTokens: jest.fn(),
      logout: jest.fn(),
    }),
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Utility', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('api.get', () => {
    it('should make GET request to correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: 1 } }),
      });

      const result = await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/test`,
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual({ id: 1 });
    });

    it('should include auth token in header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await api.get('/test', 'my-token');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        }),
      );
    });
  });

  describe('api.post', () => {
    it('should make POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: 1 } }),
      });

      const result = await api.post('/test', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        }),
      );
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('api.put', () => {
    it('should make PUT request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { updated: true } }),
      });

      await api.put('/test/1', { name: 'updated' }, 'token');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/test/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' }),
        }),
      );
    });
  });

  describe('api.delete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: null }),
      });

      await api.delete('/test/1', 'token');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/test/1`,
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Bad request' }),
      });

      await expect(api.get('/test')).rejects.toThrow('Bad request');
    });

    it('should throw ApiError with default message on non-ok response without message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(api.get('/test')).rejects.toThrow('Error en la solicitud');
    });

    it('should throw ApiError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.get('/test')).rejects.toThrow('Error de conexion');
    });
  });

  describe('Response unwrapping', () => {
    it('should unwrap success/data envelope', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { users: [] } }),
      });

      const result = await api.get('/users');
      expect(result).toEqual({ users: [] });
    });

    it('should unwrap success/data/meta envelope', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [{ id: 1 }],
            meta: { total: 1 },
          }),
      });

      const result = await api.get<{ data: unknown[]; meta: { total: number } }>('/items');
      expect(result).toEqual({ data: [{ id: 1 }], meta: { total: 1 } });
    });

    it('should pass through raw responses without envelope', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'raw' }),
      });

      const result = await api.get('/raw');
      expect(result).toEqual({ id: 1, name: 'raw' });
    });
  });
});
