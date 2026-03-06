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

interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isActive: boolean;
  daysOfWeek: number[];
}

export function useTimeSlots() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['timeSlots'],
    queryFn: () => api.get<TimeSlot[]>('/bookings/slots', accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

interface CreateBookingData {
  childId: string;
  slotId: string;
  date: string;
  passType?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  weeklyFrequency?: number;
  notes?: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateBookingData) =>
      api.post<Booking>('/bookings', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// CALENDARIO MENSUAL Y COBROS
// ═══════════════════════════════════════════════════════════════════

interface CalendarDay {
  day: number;
  date: string;
  dayOfWeek: number;
  attendance: {
    id: string;
    status: string;
    billingType: 'PREPAID' | 'POSTPAID' | 'BILLED';
    checkInTime: string | null;
    checkOutTime: string | null;
    hasLunch: boolean;
    hasPickup: boolean;
    pickupTime: string | null;
  } | null;
}

interface MonthlyCalendarResponse {
  child: {
    id: string;
    firstName: string;
    lastName: string;
    guardian: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  month: number;
  year: number;
  calendar: CalendarDay[];
  summary: {
    totalDays: number;
    prepaidDays: number;
    postpaidDays: number;
    billedDays: number;
    monthlyBilling: {
      id: string;
      status: string;
      totalAmount: number;
      paidAt: string | null;
    } | null;
  };
}

export function useMonthlyCalendar(childId: string, year: number, month: number) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'calendar', childId, year, month],
    queryFn: () =>
      api.get<MonthlyCalendarResponse>(
        `/attendance/calendar/${childId}/${year}/${month}`,
        accessToken ?? undefined
      ),
    enabled: !!accessToken && !!childId,
  });
}

interface MonthlyBilling {
  id: string;
  month: number;
  year: number;
  totalDays: number;
  pricePerDay: number;
  subtotal: number;
  discountPercent: number | null;
  discountAmount: number | null;
  totalAmount: number;
  status: string;
  method: string | null;
  paidAt: string | null;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  guardian: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  _count: {
    attendances: number;
  };
}

export function useMonthlyBillings(status?: string, month?: number, year?: number) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'billing', status, month, year],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      return api.get<PaginatedResponse<MonthlyBilling>>(
        `/attendance/billing?${params.toString()}`,
        accessToken ?? undefined
      );
    },
    enabled: !!accessToken,
  });
}

interface PendingChild {
  id: string;
  firstName: string;
  lastName: string;
  guardian: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pendingDays: number;
}

export function usePendingBillings(year: number, month: number) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'billing', 'pending', year, month],
    queryFn: () =>
      api.get<PendingChild[]>(
        `/attendance/billing/pending/${year}/${month}`,
        accessToken ?? undefined
      ),
    enabled: !!accessToken,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      childId: string;
      date?: string;
      slotId?: string;
      billingType?: 'PREPAID' | 'POSTPAID';
      hasLunch?: boolean;
      hasPickup?: boolean;
      pickupTime?: string;
      notes?: string;
    }) => api.post<Attendance>('/attendance/check-in', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });
}

export function useUpdateAttendanceDetails() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { hasLunch?: boolean; hasPickup?: boolean; pickupTime?: string; notes?: string } }) =>
      api.patch<Attendance>(`/attendance/${id}`, data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/attendance/${id}`, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });
}

export function useGenerateMonthlyBilling() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: { childId: string; month: number; year: number }) =>
      api.post<MonthlyBilling>('/attendance/billing/generate', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });
}

export function useMarkBillingPaid() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: string }) =>
      api.post<MonthlyBilling>(`/attendance/billing/${id}/pay`, { method }, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// CALENDARIO GENERAL (FullCalendar)
// ═══════════════════════════════════════════════════════════════════

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    childId: string;
    childName: string;
    profileImage: string | null;
    status: string;
    billingType: 'PREPAID' | 'POSTPAID' | 'BILLED';
    checkInTime: string | null;
    checkOutTime: string | null;
    hasLunch: boolean;
    hasPickup: boolean;
    pickupTime: string | null;
    notes: string | null;
  };
}

export function useCalendarEvents(from: string, to: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'calendar-events', from, to],
    queryFn: () =>
      api.get<CalendarEvent[]>(
        `/attendance/calendar-events?from=${from}&to=${to}`,
        accessToken ?? undefined
      ),
    enabled: !!accessToken && !!from && !!to,
    refetchInterval: 30000, // Auto-refresh cada 30 segundos
  });
}
