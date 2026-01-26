'use client';

import { useBookings, useCancelBooking } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';
import type { BookingStatus } from '@/types';

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

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_TEXT: Record<BookingStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

export default function BookingsPage() {
  const { data: bookingsData, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const bookings = bookingsData?.data || [];

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    setCancellingId(id);
    try {
      await cancelBooking.mutateAsync(id);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona las reservas de horarios para tus niños
          </p>
        </div>
        <Button asChild>
          <Link href="/reservas/nueva">Nueva Reserva</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-8 w-8 text-primary"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="m9 16 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crea una reserva para inscribir a tu niño en nuestros horarios
            </p>
            <Button asChild>
              <Link href="/reservas/nueva">Crear primera reserva</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.child?.firstName} {booking.child?.lastName}
                    </CardTitle>
                    <CardDescription>
                      {booking.timeSlot?.name} ({booking.timeSlot?.startTime} - {booking.timeSlot?.endTime})
                    </CardDescription>
                  </div>
                  <Badge className={STATUS_COLORS[booking.status]}>
                    {STATUS_TEXT[booking.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Días de asistencia</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {booking.selectedDays.map((day) => (
                        <Badge key={day} variant="outline">
                          {DAY_NAMES[day]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                    <p className="font-medium">{formatDate(booking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frecuencia</p>
                    <p className="font-medium">{booking.weeklyFrequency}x por semana</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio mensual</p>
                    <p className="font-medium text-lg">{formatCurrency(booking.monthlyPrice)}</p>
                  </div>
                </div>

                {booking.status === 'CONFIRMED' && (
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? 'Cancelando...' : 'Cancelar Reserva'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
