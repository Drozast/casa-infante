'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound, Shield, Lock } from 'lucide-react';

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayuscula')
    .regex(/[0-9]/, 'Debe incluir al menos un numero')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Debe incluir al menos un simbolo'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordForm) =>
      api.post('/auth/reset-password', { token, newPassword: data.newPassword }),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al restablecer contrasena',
      });
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    mutation.mutate(data);
  };

  let cardContent;

  if (!token) {
    cardContent = (
      <>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Enlace invalido</CardTitle>
          <CardDescription className="text-base mt-2">
            El enlace de recuperacion no es valido. Solicita uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-medium">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </CardFooter>
      </>
    );
  } else if (success) {
    cardContent = (
      <>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-lime-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Contrasena actualizada</CardTitle>
          <CardDescription className="text-base mt-2">
            Tu contrasena ha sido restablecida exitosamente. Ya puedes iniciar sesion.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Link href="/login" className="w-full">
            <Button className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-medium">
              Iniciar sesion
            </Button>
          </Link>
        </CardFooter>
      </>
    );
  } else {
    cardContent = (
      <>
        <CardHeader className="text-center pb-2">
          <div className="lg:hidden mx-auto mb-4 w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center p-2">
            <Image src="/logo.png" alt="Casa Infante" width={60} height={60} className="rounded-lg" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Nueva Contrasena</CardTitle>
          <CardDescription>Ingresa tu nueva contrasena</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-700">Nueva contrasena</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 8 caracteres, 1 mayuscula, 1 numero, 1 simbolo"
                  className="h-12 border-gray-200 focus:border-lime-500 focus:ring-lime-500 pr-12"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar contrasena</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contrasena"
                className="h-12 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-medium"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                'Restablecer contrasena'
              )}
            </Button>
          </CardFooter>
        </form>
      </>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-lime-600 to-lime-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesion
          </Link>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2">
              <Image src="/logo.png" alt="Casa Infante" width={48} height={48} className="rounded-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Casa Infante</h1>
              <p className="text-emerald-100">Guarderia - AfterSchool</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Crea tu nueva contrasena
            </h2>
            <p className="text-xl text-emerald-100">
              Elige una contrasena segura para proteger tu cuenta.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <span>Minimo 6 caracteres</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span>Tu contrasena se almacena de forma segura</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <span>El enlace expira en 1 hora</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-emerald-100 text-sm">
            Isla Teja, Valdivia - Maria Veronica Gajardo
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-lime-50 via-white to-emerald-50">
        <div className="w-full max-w-md">
          <Link href="/login" className="lg:hidden inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 transition mb-6">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesion
          </Link>

          <Card className="border-0 shadow-xl">
            {cardContent}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
