'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, User, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Booking } from '@/types';

interface BookingCalendarProps {
  bookings: Booking[];
  onDayClick?: (date: Date, dayBookings: Booking[]) => void;
  onAddBooking?: (date: Date) => void;
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-blue-500',
  NO_SHOW: 'bg-gray-500',
};

export function BookingCalendar({ bookings, onDayClick, onAddBooking }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { year, month } = useMemo(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
  }), [currentDate]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean; bookings: Booking[] }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, bookings: [] });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date).toISOString().split('T')[0];
        return bookingDate === dateStr;
      });
      days.push({ date, isCurrentMonth: true, bookings: dayBookings });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false, bookings: [] });
    }

    return days;
  }, [year, month, bookings]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return calendarDays.find(d => d.date.toISOString().split('T')[0] === dateStr);
  }, [selectedDate, calendarDays]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: typeof calendarDays[0]) => {
    setSelectedDate(day.date);
    if (onDayClick) {
      onDayClick(day.date, day.bookings);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar */}
      <div className="flex-1">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {MONTHS[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative min-h-[80px] p-1 rounded-lg border transition-colors text-left
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-muted-foreground'}
                    ${isToday(day.date) ? 'border-lime-500 border-2' : 'border-gray-200'}
                    ${isSelected(day.date) ? 'ring-2 ring-lime-500 ring-offset-1' : ''}
                    hover:bg-lime-50
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isToday(day.date) ? 'bg-lime-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>

                  {day.bookings.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {day.bookings.slice(0, 3).map((booking, i) => (
                        <div
                          key={booking.id}
                          className={`
                            text-xs px-1 py-0.5 rounded truncate
                            ${STATUS_COLORS[booking.status]} text-white
                          `}
                          title={booking.child ? `${booking.child.firstName} ${booking.child.lastName}` : 'Sin niño'}
                        >
                          {booking.child?.firstName || '?'}
                        </div>
                      ))}
                      {day.bookings.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{day.bookings.length - 3} más
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-xs text-muted-foreground">Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-xs text-muted-foreground">Completada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-xs text-muted-foreground">Cancelada</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day detail panel */}
      <div className="lg:w-80">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedDate ? (
                  <>
                    {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
                  </>
                ) : (
                  'Selecciona un día'
                )}
              </CardTitle>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Haz clic en un día para ver los detalles
              </p>
            ) : !selectedDayData || selectedDayData.bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No hay reservas para este día
                </p>
                {onAddBooking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddBooking(selectedDate)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar reserva
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">
                    {selectedDayData.bookings.length} niño(s)
                  </Badge>
                  {onAddBooking && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddBooking(selectedDate)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar
                    </Button>
                  )}
                </div>

                {selectedDayData.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 rounded-lg border bg-gray-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-lime-100 flex items-center justify-center text-sm font-medium text-lime-700">
                          {booking.child?.firstName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {booking.child?.firstName} {booking.child?.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${STATUS_COLORS[booking.status]} text-white text-xs`}>
                        {booking.status === 'CONFIRMED' ? 'OK' : booking.status[0]}
                      </Badge>
                    </div>

                    {booking.slot && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {booking.slot.name} ({booking.slot.startTime} - {booking.slot.endTime})
                      </div>
                    )}

                    {booking.child?.schoolName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <School className="h-3 w-3" />
                        {booking.child.schoolName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
