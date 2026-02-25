import { api, ApiError } from '@/lib/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock auth store
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      refreshToken: null,
      setTokens: jest.fn(),
      logout: jest.fn(),
    })),
  },
}));

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const result = await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include auth token in header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await api.get('/test', 'my-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        })
      );
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      const requestBody = { name: 'Test' };
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const result = await api.post('/test', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('put', () => {
    it('should make a PUT request with body', async () => {
      const requestBody = { name: 'Updated' };
      const mockData = { id: 1, name: 'Updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const result = await api.put('/test/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: null }),
      });

      await api.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw ApiError on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      });

      await expect(api.get('/test')).rejects.toThrow('Bad request');
    });

    it('should throw ApiError with status code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.get('/test')).rejects.toThrow(
        'Error de conexion. Verifica tu internet.'
      );
    });
  });

  describe('response unwrapping', () => {
    it('should unwrap { success, data } envelope', async () => {
      const innerData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: innerData }),
      });

      const result = await api.get('/test');

      expect(result).toEqual(innerData);
    });

    it('should include meta when present', async () => {
      const innerData = [{ id: 1 }];
      const meta = { total: 10, page: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: innerData, meta }),
      });

      const result = await api.get('/test');

      expect(result).toEqual({ data: innerData, meta });
    });

    it('should return raw data if not wrapped', async () => {
      const rawData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => rawData,
      });

      const result = await api.get('/test');

      expect(result).toEqual(rawData);
    });
  });
});

describe('ApiError', () => {
  it('should create error with message and status', () => {
    const error = new ApiError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error).toBeInstanceOf(Error);
  });

  it('should include data if provided', () => {
    const data = { field: 'email', message: 'Invalid' };
    const error = new ApiError('Validation error', 422, data);

    expect(error.data).toEqual(data);
  });
});
