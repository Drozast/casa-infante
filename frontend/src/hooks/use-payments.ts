'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Payment, PaginatedResponse } from '@/types';

export function usePayments() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get<PaginatedResponse<Payment>>('/payments', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function usePendingPayments() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['payments', 'pending'],
    queryFn: () => api.get<Payment[]>('/payments/pending', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function usePayment(id: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => api.get<Payment>(`/payments/${id}`, accessToken ?? undefined),
    enabled: !!accessToken && !!id,
  });
}

interface InitiatePaymentResponse {
  token: string;
  url: string;
}

export function useInitiatePayment() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (bookingId: string) =>
      api.post<InitiatePaymentResponse>('/payments/initiate', { bookingId }, accessToken ?? undefined),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (transactionToken: string) =>
      api.post<Payment>('/payments/confirm', { token: transactionToken }, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
