'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { DashboardStats } from '@/types';

export function useDashboardStats() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}
