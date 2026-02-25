import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAdminBookings,
  useAdminUsers,
  useAdminChildren,
  useAdminPayments,
  useTimeSlots,
} from '@/hooks/use-admin';

// Mock the auth store
const mockAccessToken = 'mock-access-token';
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({ accessToken: mockAccessToken }),
}));

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { api } from '@/lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAdminBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch bookings when accessToken exists', async () => {
    const mockBookings = {
      data: [{ id: 'booking-1', status: 'CONFIRMED' }],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (api.get as jest.Mock).mockResolvedValue(mockBookings);

    const { result } = renderHook(() => useAdminBookings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.get).toHaveBeenCalledWith('/bookings', mockAccessToken);
    expect(result.current.data).toEqual(mockBookings);
  });
});

describe('useAdminUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users when accessToken exists', async () => {
    const mockUsers = {
      data: [{ id: 'user-1', email: 'test@example.com' }],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (api.get as jest.Mock).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.get).toHaveBeenCalledWith('/users', mockAccessToken);
    expect(result.current.data).toEqual(mockUsers);
  });
});

describe('useAdminChildren', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch children when accessToken exists', async () => {
    const mockChildren = {
      data: [{ id: 'child-1', firstName: 'Lucas' }],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (api.get as jest.Mock).mockResolvedValue(mockChildren);

    const { result } = renderHook(() => useAdminChildren(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.get).toHaveBeenCalledWith('/children', mockAccessToken);
    expect(result.current.data).toEqual(mockChildren);
  });
});

describe('useAdminPayments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch payments when accessToken exists', async () => {
    const mockPayments = {
      data: [{ id: 'payment-1', status: 'COMPLETED' }],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (api.get as jest.Mock).mockResolvedValue(mockPayments);

    const { result } = renderHook(() => useAdminPayments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.get).toHaveBeenCalledWith('/payments', mockAccessToken);
    expect(result.current.data).toEqual(mockPayments);
  });
});

describe('useTimeSlots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch time slots when accessToken exists', async () => {
    const mockTimeSlots = [
      { id: 'slot-1', name: 'Mañana', startTime: '08:00', endTime: '13:00' },
      { id: 'slot-2', name: 'Tarde', startTime: '14:00', endTime: '19:00' },
    ];
    (api.get as jest.Mock).mockResolvedValue(mockTimeSlots);

    const { result } = renderHook(() => useTimeSlots(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.get).toHaveBeenCalledWith('/bookings/slots', mockAccessToken);
    expect(result.current.data).toEqual(mockTimeSlots);
  });
});
