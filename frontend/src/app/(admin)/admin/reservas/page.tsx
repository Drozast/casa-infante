'use client';

import { useAdminBookings } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '@/types';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

const DAYS_TEXT: Record<number, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
};

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

export default function AdminBookingsPage() {
  const { data: bookingsData, isLoading } = useAdminBookings();

  const bookings = bookingsData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Reservas</h1>
        <p className="text-muted-foreground">
          Administra todas las reservas de la plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservas</CardTitle>
          <CardDescription>
            {bookings.length} reserva(s) en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay reservas registradas
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {booking.child ? (
                        <span className="font-semibold text-primary">
                          {booking.child.firstName[0]}
                          {booking.child.lastName[0]}
                        </span>
                      ) : (
                        <span className="font-semibold text-primary">?</span>
                      )}
                    </div>
                    <div>
                      {booking.child && (
                        <p className="font-medium">
                          {booking.child.firstName} {booking.child.lastName}
                        </p>
                      )}
                      {booking.timeSlot && (
                        <p className="text-sm text-muted-foreground">
                          {booking.timeSlot.name} ({booking.timeSlot.startTime} - {booking.timeSlot.endTime})
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Días: {booking.selectedDays.map((d) => DAYS_TEXT[d]).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[booking.status]}>
                        {STATUS_TEXT[booking.status]}
                      </Badge>
                      <span className="font-medium text-primary">
                        {formatCurrency(booking.monthlyPrice)}/mes
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Desde: {formatDate(booking.startDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
