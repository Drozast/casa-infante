'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Booking, TimeSlot, PricingConfig, PaginatedResponse } from '@/types';

export function useBookings() {
  const { accessToken, user } = useAuthStore();
  const isGuardian = user?.role === 'GUARDIAN';

  return useQuery({
    queryKey: ['bookings', isGuardian ? 'my-bookings' : 'all'],
    queryFn: () => {
      const endpoint = isGuardian ? '/bookings/my-bookings' : '/bookings';
      return api.get<PaginatedResponse<Booking>>(endpoint, accessToken ?? undefined);
    },
    enabled: !!accessToken,
  });
}

export function useBooking(id: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => api.get<Booking>(`/bookings/${id}`, accessToken ?? undefined),
    enabled: !!accessToken && !!id,
  });
}

export function useTimeSlots() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['time-slots'],
    queryFn: () => api.get<TimeSlot[]>('/time-slots', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function usePricingConfigs() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['pricing-configs'],
    queryFn: () => api.get<PricingConfig[]>('/pricing', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

interface CreateBookingData {
  childId: string;
  timeSlotId: string;
  startDate: string;
  selectedDays: number[];
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateBookingData) =>
      api.post<Booking>('/bookings', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (id: string) =>
      api.put<Booking>(`/bookings/${id}/cancel`, {}, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

interface CalculatePriceParams {
  timeSlotId: string;
  selectedDays: number[];
}

export function useCalculatePrice() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (params: CalculatePriceParams) =>
      api.post<{ monthlyPrice: number; pricePerSession: number }>(
        '/bookings/calculate-price',
        params,
        accessToken ?? undefined
      ),
  });
}
