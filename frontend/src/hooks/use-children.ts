'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { Child, PaginatedResponse } from '@/types';

export function useChildren() {
  const { accessToken, user } = useAuthStore();
  const isGuardian = user?.role === 'GUARDIAN';

  return useQuery({
    queryKey: ['children', isGuardian ? 'my-children' : 'all'],
    queryFn: () => {
      const endpoint = isGuardian ? '/children/my-children' : '/children';
      return api.get<PaginatedResponse<Child>>(endpoint, accessToken ?? undefined);
    },
    enabled: !!accessToken,
  });
}

export function useChild(id: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['children', id],
    queryFn: () => api.get<Child>(`/children/${id}`, accessToken ?? undefined),
    enabled: !!accessToken && !!id,
  });
}

interface CreateChildData {
  firstName: string;
  lastName: string;
  birthDate: string;
  rut?: string;
  school?: string;
  grade?: string;
  preferences?: {
    allergies?: string;
    medicalConditions?: string;
    medications?: string;
    dietaryRestrictions?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    authorizedPickup?: string;
    notes?: string;
  };
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateChildData) =>
      api.post<Child>('/children', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateChildData> }) =>
      api.put<Child>(`/children/${id}`, data, accessToken ?? undefined),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['children', id] });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/children/${id}`, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}
