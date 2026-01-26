'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useAdminStats } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Baby,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Settings,
  BookOpen,
  CreditCard,
  UserCog,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

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

// Componente de contador animado
function AnimatedCounter({ value, isLoading }: { value: number; isLoading: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isLoading || value === 0) return;

    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  if (isLoading) return <span className="animate-pulse">...</span>;
  return <span>{count}</span>;
}

const stats = [
  {
    key: 'totalUsers',
    title: 'Total Usuarios',
    description: 'Apoderados registrados',
    icon: Users,
    bgColor: 'bg-lime-100',
    textColor: 'text-lime-600',
    borderColor: 'border-lime-200'
  },
  {
    key: 'totalChildren',
    title: 'Niños Inscritos',
    description: 'Total de niños',
    icon: Baby,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'activeBookings',
    title: 'Reservas Activas',
    description: 'Actualmente activas',
    icon: Calendar,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    key: 'monthlyRevenue',
    title: 'Ingresos del Mes',
    description: 'Pagos recibidos este mes',
    icon: DollarSign,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    isCurrency: true
  },
  {
    key: 'pendingPayments',
    title: 'Pagos Pendientes',
    description: 'Por cobrar',
    icon: Clock,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200'
  },
  {
    key: 'todayAttendance',
    title: 'Asistencia Hoy',
    description: 'Niños presentes',
    icon: CheckCircle,
    bgColor: 'bg-lime-100',
    textColor: 'text-lime-600',
    borderColor: 'border-lime-200'
  }
];

const quickActions = [
  {
    title: 'Gestión de Usuarios',
    description: 'Administra apoderados y staff',
    icon: UserCog,
    href: '/admin/usuarios'
  },
  {
    title: 'Reservas',
    description: 'Gestiona todas las reservas',
    icon: Calendar,
    href: '/admin/reservas'
  },
  {
    title: 'Pagos',
    description: 'Control de facturación',
    icon: CreditCard,
    href: '/admin/pagos'
  },
  {
    title: 'Talleres',
    description: 'Gestiona los talleres extracurriculares',
    icon: BookOpen,
    href: '/admin/talleres'
  },
  {
    title: 'Asistencia',
    description: 'Control de asistencia diaria',
    icon: CheckCircle,
    href: '/staff'
  },
  {
    title: 'Configuración',
    description: 'Ajustes del sistema',
    icon: Settings,
    href: '/admin/configuracion'
  }
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: statsData, isLoading } = useAdminStats();

  const getStatValue = (key: string) => {
    if (!statsData) return 0;
    return (statsData as unknown as Record<string, number>)[key] || 0;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header con gradiente */}
      <AnimateOnScroll>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-lime-500 via-lime-600 to-emerald-600 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-lime-100 text-sm font-medium">Panel de Administración</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.firstName}!
            </h1>
            <p className="text-lime-100 max-w-xl">
              Aquí puedes gestionar todos los aspectos de Casa Infante.
              Revisa las estadísticas y accede rápidamente a las herramientas de gestión.
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <AnimateOnScroll key={stat.key} delay={index * 50}>
            <Card className={`relative overflow-hidden border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgColor} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity -translate-y-1/2 translate-x-1/2`} />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.isCurrency ? (
                    isLoading ? '...' : formatCurrency(getStatValue(stat.key))
                  ) : (
                    <AnimatedCounter value={getStatValue(stat.key)} isLoading={isLoading} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>

                {/* Indicador de tendencia */}
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-lime-500" />
                  <span className="text-xs text-lime-600 font-medium">Actualizado</span>
                </div>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <AnimateOnScroll>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-lime-500 rounded-full" />
            Acciones Rápidas
          </h2>
        </AnimateOnScroll>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <AnimateOnScroll key={action.href} delay={index * 50}>
              <Link href={action.href}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-lime-300 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-lime-100 group-hover:bg-lime-500 transition-colors duration-300">
                        <action.icon className="h-6 w-6 text-lime-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-lime-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-lime-700 transition-colors duration-300">
                      {action.title}
                    </CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <AnimateOnScroll delay={300}>
        <Card className="bg-gradient-to-r from-lime-50 to-emerald-50 border-lime-200">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-full bg-lime-100">
              <Sparkles className="h-6 w-6 text-lime-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">Consejo del día</h3>
              <p className="text-sm text-gray-600">
                Revisa los pagos pendientes regularmente para mantener al día la facturación de Casa Infante.
              </p>
            </div>
            <Button asChild className="bg-lime-600 hover:bg-lime-700 transition-all duration-300 hover:scale-105">
              <Link href="/admin/pagos">
                Ver Pagos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </AnimateOnScroll>
    </div>
  );
}
