'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type {
  User,
  Child,
  Booking,
  Payment,
  Workshop,
  Attendance,
  PaginatedResponse
} from '@/types';

export function useAdminUsers() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<PaginatedResponse<User>>('/users', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useAdminChildren() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'children'],
    queryFn: () => api.get<PaginatedResponse<Child>>('/children', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useAdminBookings() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: () => api.get<PaginatedResponse<Booking>>('/bookings', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useAdminPayments() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: () => api.get<PaginatedResponse<Payment>>('/payments', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useAdminWorkshops() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'workshops'],
    queryFn: () => api.get<Workshop[]>('/workshops', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useAdminAttendance(date: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'attendance', date],
    queryFn: () => api.get<Attendance[]>(`/attendance?date=${date}`, accessToken ?? undefined),
    enabled: !!accessToken && !!date,
  });
}

interface AdminStats {
  totalUsers: number;
  totalChildren: number;
  activeBookings: number;
  monthlyRevenue: number;
  pendingPayments: number;
  todayAttendance: number;
}

export function useAdminStats() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/reports/dashboard', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.put<User>(`/users/${userId}`, { role }, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useCreateWorkshop() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: Partial<Workshop>) =>
      api.post<Workshop>('/workshops', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workshops'] });
    },
  });
}

export function useUpdateWorkshop() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workshop> }) =>
      api.put<Workshop>(`/workshops/${id}`, data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workshops'] });
    },
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      childId: string;
      date: string;
      timeSlotId: string;
      status: string;
      notes?: string;
    }) => api.post<Attendance>('/attendance', data, accessToken ?? undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', variables.date] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) =>
      api.put<Attendance>(`/attendance/${id}`, data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance'] });
    },
  });
}
