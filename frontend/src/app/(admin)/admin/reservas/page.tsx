'use client';

import { useState } from 'react';
import { useAdminBookings } from '@/hooks/use-admin';
import { useQueryClient } from '@tanstack/react-query';
import { BookingCalendar } from '@/components/calendar/booking-calendar';
import { AddBookingModal } from '@/components/calendar/add-booking-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List, Plus } from 'lucide-react';

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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

const STATUS_TEXT: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No Asistió',
};

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const { data: bookingsData, isLoading } = useAdminBookings();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const bookings = bookingsData?.data || [];

  // Stats
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    const bookingDate = new Date(b.date).toISOString().split('T')[0];
    return bookingDate === today && (b.status === 'CONFIRMED' || b.status === 'PENDING');
  });

  const handleAddBooking = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleNewBookingClick = () => {
    setSelectedDate(new Date());
    setModalOpen(true);
  };

  const handleBookingSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Reservas</h1>
          <p className="text-muted-foreground">
            Administra todas las reservas de la plataforma
          </p>
        </div>
        <Button
          className="gap-2 bg-lime-600 hover:bg-lime-700"
          onClick={handleNewBookingClick}
        >
          <Plus className="h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hoy</CardDescription>
            <CardTitle className="text-3xl">{todayBookings.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">niños esperados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmadas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{confirmedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">reservas activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">por confirmar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{bookings.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">reservas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')}>
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="animate-pulse text-center text-muted-foreground">
                  Cargando calendario...
                </div>
              </CardContent>
            </Card>
          ) : (
            <BookingCalendar
              bookings={bookings}
              onAddBooking={handleAddBooking}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Reservas</CardTitle>
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
                        <div className="h-12 w-12 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                          {booking.child ? (
                            <span className="font-semibold text-lime-700">
                              {booking.child.firstName[0]}
                              {booking.child.lastName[0]}
                            </span>
                          ) : (
                            <span className="font-semibold text-lime-700">?</span>
                          )}
                        </div>
                        <div>
                          {booking.child && (
                            <p className="font-medium">
                              {booking.child.firstName} {booking.child.lastName}
                            </p>
                          )}
                          {booking.slot && (
                            <p className="text-sm text-muted-foreground">
                              {booking.slot.name} ({booking.slot.startTime} - {booking.slot.endTime})
                            </p>
                          )}
                          {booking.slot?.daysOfWeek && (
                            <p className="text-sm text-muted-foreground">
                              Días: {booking.slot.daysOfWeek.map((d) => DAYS_TEXT[d]).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[booking.status]}>
                            {STATUS_TEXT[booking.status]}
                          </Badge>
                          <span className="font-medium text-lime-700">
                            {formatCurrency(Number(booking.totalPrice))}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Fecha: {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para agregar reserva */}
      <AddBookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedDate={selectedDate}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
