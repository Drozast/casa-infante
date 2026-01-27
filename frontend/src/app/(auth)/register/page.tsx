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
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, Shield, Clock, Users } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electronico invalido'),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, 'Numero de telefono invalido').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una letra mayuscula')
    .regex(/[0-9]/, 'Debe incluir al menos un numero')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Debe incluir al menos un simbolo'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...userData } = data;
    registerUser(userData);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-lime-600 to-lime-500 p-12 flex-col justify-between relative overflow-hidden">
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
              <p className="text-emerald-100">Guarderia - AfterSchool</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Unete a nuestra familia
            </h2>
            <p className="text-xl text-emerald-100">
              Registrate para inscribir a tu hijo y disfrutar de todos los beneficios de Casa Infante.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span>Registro seguro y protegido</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <span>Reservas online 24/7</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <span>Seguimiento del progreso de tu hijo</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-emerald-100 text-sm">
            Isla Teja, Valdivia - Maria Veronica Gajardo
          </p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
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
              <CardTitle className="text-2xl text-gray-900">Crear Cuenta</CardTitle>
              <CardDescription>Registrate como apoderado para comenzar</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">Nombre</Label>
                    <Input
                      id="firstName"
                      placeholder="Maria"
                      className="h-11 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">Apellido</Label>
                    <Input
                      id="lastName"
                      placeholder="Gonzalez"
                      className="h-11 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Correo electronico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.cl"
                    className="h-11 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">Telefono (WhatsApp)</Label>
                  <Input
                    id="phone"
                    placeholder="+56912345678"
                    className="h-11 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Contrasena</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimo 8 caracteres, 1 mayuscula, 1 numero, 1 simbolo"
                      className="h-11 border-gray-200 focus:border-lime-500 focus:ring-lime-500 pr-12"
                      {...register('password')}
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
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar contrasena</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contrasena"
                    className="h-11 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Benefits reminder */}
                <div className="bg-lime-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-lime-800">Al registrarte podras:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-lime-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Inscribir a tus hijos facilmente</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-lime-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Gestionar reservas y pagos online</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-lime-700">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Ver la asistencia de tus hijos</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-lime-600 hover:bg-lime-700 text-white font-medium"
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear mi cuenta'
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-lime-600 hover:text-lime-700 font-medium hover:underline">
                    Inicia sesion
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-6">
            Al registrarte, aceptas nuestros terminos de servicio y politica de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
