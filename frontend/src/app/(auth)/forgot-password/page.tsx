'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { ArrowLeft, Loader2, Mail, KeyRound, Shield } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordForm) =>
      api.post('/auth/forgot-password', data),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al enviar solicitud',
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-lime-500 via-lime-600 to-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
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
              <p className="text-lime-100">Guarderia - AfterSchool</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Recupera tu acceso
            </h2>
            <p className="text-xl text-lime-100">
              No te preocupes, te enviaremos un enlace para restablecer tu contrasena.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <span>Recibe un enlace en tu correo</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <span>Crea una nueva contrasena segura</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span>Proceso seguro y confidencial</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-lime-100 text-sm">
            Isla Teja, Valdivia - Maria Veronica Gajardo
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-lime-50 via-white to-emerald-50">
        <div className="w-full max-w-md">
          <Link href="/login" className="lg:hidden inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 transition mb-6">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesion
          </Link>

          <Card className="border-0 shadow-xl">
            {submitted ? (
              <>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-lime-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Revisa tu correo</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Si el correo esta registrado, recibiras un enlace para restablecer tu contrasena.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-lime-50 rounded-xl p-4 text-sm text-lime-800">
                    <p className="font-medium mb-1">No recibes el correo?</p>
                    <ul className="space-y-1 text-lime-700">
                      <li>Revisa tu carpeta de spam</li>
                      <li>Verifica que el correo sea correcto</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full h-12 border-lime-300 text-lime-700 hover:bg-lime-50">
                      Volver al inicio de sesion
                    </Button>
                  </Link>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="text-center pb-2">
                  <div className="lg:hidden mx-auto mb-4 w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center p-2">
                    <Image src="/logo.png" alt="Casa Infante" width={60} height={60} className="rounded-lg" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Recuperar Contrasena</CardTitle>
                  <CardDescription>Ingresa tu correo y te enviaremos un enlace</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Correo electronico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.cl"
                        className="h-12 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
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
                          Enviando...
                        </>
                      ) : (
                        'Enviar enlace de recuperacion'
                      )}
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                      Recordaste tu contrasena?{' '}
                      <Link href="/login" className="text-lime-600 hover:text-lime-700 font-medium hover:underline">
                        Inicia sesion
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
