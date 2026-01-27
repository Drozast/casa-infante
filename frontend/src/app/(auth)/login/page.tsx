'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Eye, EyeOff, Loader2, ArrowLeft, TreePine, Users, Home as HomeIcon, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    if (loginError) resetLoginError();
    login(data);
  };

  const handleInputChange = () => {
    if (loginError) resetLoginError();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-lime-500 via-lime-600 to-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2">
              <Image
                src="/logo.png"
                alt="Casa Infante"
                width={48}
                height={48}
                className="rounded-lg"
              />
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
              Bienvenido de vuelta
            </h2>
            <p className="text-xl text-lime-100">
              Accede a tu cuenta para gestionar las reservas y seguir el progreso de tu hijo.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <span>Grupos pequenos y atencion personalizada</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <TreePine className="h-5 w-5" />
              </div>
              <span>Salidas a la naturaleza en Isla Teja</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <HomeIcon className="h-5 w-5" />
              </div>
              <span>Ambiente acogedor como en casa</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-lime-100 text-sm">
            Isla Teja, Valdivia - Maria Veronica Gajardo
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-lime-50 via-white to-emerald-50">
        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 transition mb-6">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="lg:hidden mx-auto mb-4 w-20 h-20 bg-lime-100 rounded-2xl flex items-center justify-center p-2">
                <Image
                  src="/logo.png"
                  alt="Casa Infante"
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
              </div>
              <CardTitle className="text-2xl text-gray-900">Iniciar Sesion</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
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
                    {...register('email', { onChange: handleInputChange })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Contrasena</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      className="h-12 border-gray-200 focus:border-lime-500 focus:ring-lime-500 pr-12"
                      {...register('password', { onChange: handleInputChange })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-lime-600 hover:text-lime-700 hover:underline">
                    Olvidaste tu contrasena?
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                {loginError && (
                  <div className="w-full flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-medium"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O</span>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  No tienes cuenta?{' '}
                  <Link href="/register" className="text-lime-600 hover:text-lime-700 font-medium hover:underline">
                    Registrate aqui
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-6">
            Al iniciar sesion, aceptas nuestros terminos de servicio y politica de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
