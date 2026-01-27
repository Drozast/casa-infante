'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useChildren } from '@/hooks/use-children';
import { useBookings } from '@/hooks/use-bookings';
import { usePendingPayments } from '@/hooks/use-payments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  CreditCard,
  ArrowRight,
  Sparkles,
  Plus,
  Eye,
  Baby,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Hook para animaciones al scroll
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Componente animado
function AnimateOnScroll({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${className} ${
        isInView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: childrenData, isLoading: loadingChildren } = useChildren();
  const { data: bookingsData, isLoading: loadingBookings } = useBookings();
  const { data: pendingPayments, isLoading: loadingPayments } = usePendingPayments();

  const children = childrenData?.data || [];
  const bookings = bookingsData?.data || [];
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalPending = pendingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <AnimateOnScroll>
        <div className="rounded-2xl bg-lime-600 p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-lime-100 text-sm font-medium">Portal de Familias</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            ¡Hola, {user?.firstName}!
          </h1>
          <p className="text-lime-100 max-w-xl">
            Bienvenido al portal de Casa Infante. Aquí puedes gestionar las inscripciones de tus hijos, ver reservas y pagos.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Alerta de pagos pendientes */}
      {pendingPayments && pendingPayments.length > 0 && (
        <AnimateOnScroll delay={100}>
          <Card className="border-2 border-orange-200 bg-orange-50 shadow-lg">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-3 rounded-full bg-orange-100 animate-pulse">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Pagos Pendientes</h3>
                <p className="text-sm text-orange-700">
                  Tienes {pendingPayments.length} pago(s) pendiente(s) por un total de{' '}
                  <strong>{formatCurrency(totalPending)}</strong>
                </p>
              </div>
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 hover:scale-105"
              >
                <Link href="/pagos">
                  Ver Pagos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </AnimateOnScroll>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimateOnScroll delay={0}>
          <Card className="relative overflow-hidden border-2 border-lime-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-gray-600">Niños Registrados</CardTitle>
              <div className="p-2 rounded-xl bg-lime-100 group-hover:scale-110 transition-transform duration-300">
                <Baby className="h-5 w-5 text-lime-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-lime-600">
                {loadingChildren ? '...' : children.length}
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>

        <AnimateOnScroll delay={50}>
          <Card className="relative overflow-hidden border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-gray-600">Reservas Activas</CardTitle>
              <div className="p-2 rounded-xl bg-blue-100 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-blue-600">
                {loadingBookings ? '...' : activeBookings.length}
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <Card className="relative overflow-hidden border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-gray-600">Pagos Pendientes</CardTitle>
              <div className="p-2 rounded-xl bg-orange-100 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-orange-600">
                {loadingPayments ? '...' : pendingPayments?.length || 0}
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <Card className="relative overflow-hidden border-2 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pendiente</CardTitle>
              <div className="p-2 rounded-xl bg-green-100 group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-green-600">
                {loadingPayments ? '...' : formatCurrency(totalPending)}
              </div>
            </CardContent>
          </Card>
        </AnimateOnScroll>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mis Niños */}
        <AnimateOnScroll delay={200}>
          <Card className="border-2 hover:border-lime-200 transition-colors duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 bg-lime-500 rounded-full" />
                  <div>
                    <CardTitle>Mis Niños</CardTitle>
                    <CardDescription>Niños registrados en Casa Infante</CardDescription>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-lime-600 hover:bg-lime-700 transition-all duration-300 hover:scale-105">
                  <Link href="/ninos/nuevo">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingChildren ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-lime-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-muted-foreground mt-2">Cargando...</p>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-100 flex items-center justify-center">
                    <Baby className="h-8 w-8 text-lime-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No tienes niños registrados
                  </p>
                  <Button asChild className="bg-lime-600 hover:bg-lime-700 transition-all duration-300 hover:scale-105">
                    <Link href="/ninos/nuevo">
                      Registrar primer niño
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {children.map((child, index) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded-xl border-2 p-4 hover:border-lime-300 hover:shadow-md transition-all duration-300 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-lime-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <span className="font-bold text-white text-lg">
                            {child.firstName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {child.schoolName || 'Sin escuela registrada'}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="group-hover:bg-lime-100 group-hover:text-lime-700 transition-colors duration-300">
                        <Link href={`/ninos/${child.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimateOnScroll>

        {/* Reservas Activas */}
        <AnimateOnScroll delay={250}>
          <Card className="border-2 hover:border-blue-200 transition-colors duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full" />
                  <div>
                    <CardTitle>Reservas Activas</CardTitle>
                    <CardDescription>Horarios reservados actualmente</CardDescription>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105">
                  <Link href="/reservas/nueva">
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-muted-foreground mt-2">Cargando...</p>
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No tienes reservas activas
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105">
                    <Link href="/reservas/nueva">
                      Crear reserva
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.slice(0, 5).map((booking, index) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border-2 p-4 space-y-3 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-lime-500" />
                          <p className="font-medium text-gray-800">
                            {booking.child?.firstName} {booking.child?.lastName}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {booking.slot?.name}
                        </Badge>
                      </div>
                      {booking.slot?.daysOfWeek && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">Días:</span>
                          {booking.slot.daysOfWeek.map((day: number) => (
                            <Badge key={day} variant="outline" className="text-xs border-lime-300 text-lime-700">
                              {DAY_NAMES[day]}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">
                          Desde: {formatDate(booking.date)}
                        </span>
                        <span className="font-semibold text-lime-600">
                          {formatCurrency(Number(booking.totalPrice))}
                        </span>
                      </div>
                    </div>
                  ))}
                  {activeBookings.length > 5 && (
                    <Button asChild variant="ghost" className="w-full hover:bg-blue-50 text-blue-600">
                      <Link href="/reservas">
                        Ver todas las reservas
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimateOnScroll>
      </div>

      {/* Quick Actions */}
      <AnimateOnScroll delay={300}>
        <Card className="bg-lime-50 border-lime-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 rounded-full bg-lime-100">
                <Sparkles className="h-5 w-5 text-lime-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Acciones Rápidas</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/ninos/nuevo">
                <div className="p-4 rounded-xl bg-white border-2 hover:border-lime-300 hover:shadow-md transition-all duration-300 text-center group cursor-pointer">
                  <Baby className="h-6 w-6 mx-auto text-lime-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm font-medium mt-2 text-gray-700">Agregar Niño</p>
                </div>
              </Link>
              <Link href="/reservas/nueva">
                <div className="p-4 rounded-xl bg-white border-2 hover:border-blue-300 hover:shadow-md transition-all duration-300 text-center group cursor-pointer">
                  <Calendar className="h-6 w-6 mx-auto text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm font-medium mt-2 text-gray-700">Nueva Reserva</p>
                </div>
              </Link>
              <Link href="/pagos">
                <div className="p-4 rounded-xl bg-white border-2 hover:border-green-300 hover:shadow-md transition-all duration-300 text-center group cursor-pointer">
                  <CreditCard className="h-6 w-6 mx-auto text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm font-medium mt-2 text-gray-700">Ver Pagos</p>
                </div>
              </Link>
              <Link href="/perfil">
                <div className="p-4 rounded-xl bg-white border-2 hover:border-purple-300 hover:shadow-md transition-all duration-300 text-center group cursor-pointer">
                  <Users className="h-6 w-6 mx-auto text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm font-medium mt-2 text-gray-700">Mi Perfil</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    </div>
  );
}
