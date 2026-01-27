'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/components/ui/use-toast';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  rut?: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'ADMIN' | 'GUARDIAN' | 'STAFF';
      profileImage?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export function useAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, accessToken, isAuthenticated, setAuth, logout: clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      api.post<AuthResponse>('/auth/login', credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      toast({
        title: '¡Bienvenido!',
        description: `Hola ${user.firstName}`,
      });

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'STAFF') {
        router.push('/staff');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Credenciales inválidas',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) =>
      api.post<AuthResponse>('/auth/register', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada',
      });

      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al registrar',
      });
    },
  });

  const logout = () => {
    if (accessToken) {
      api.post('/auth/logout', {}, accessToken).catch(() => {});
    }
    clearAuth();
    router.push('/login');
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error?.message || null,
    registerError: registerMutation.error?.message || null,
    resetLoginError: loginMutation.reset,
  };
}
