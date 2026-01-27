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
    queryFn: async () => {
      const endpoint = isGuardian ? '/children/my-children' : '/children';
      const result = await api.get<PaginatedResponse<Child> | Child[]>(endpoint, accessToken ?? undefined);
      // Guardian endpoint returns plain array; admin returns paginated
      if (Array.isArray(result)) {
        return { data: result, total: result.length, page: 1, limit: result.length, totalPages: 1 } as PaginatedResponse<Child>;
      }
      return result as PaginatedResponse<Child>;
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
  gender?: string;
  schoolName?: string;
  schoolGrade?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  bloodType?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  familyNotes?: string;
  hasSiblings?: boolean;
  siblingsInfo?: string;
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
