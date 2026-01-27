'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Attendance, Booking, AttendanceStatus } from '@/types';

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  EXCUSED: 'bg-blue-100 text-blue-800',
};

const STATUS_TEXT: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Tarde',
  EXCUSED: 'Justificado',
};

export default function StaffAttendancePage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => api.get<Attendance[]>(`/attendance?date=${selectedDate}`, accessToken ?? undefined),
    enabled: !!accessToken && !!selectedDate,
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['staff', 'bookings'],
    queryFn: () => api.get<{ data: Booking[] }>('/bookings', accessToken ?? undefined),
    enabled: !!accessToken,
  });

  const recordAttendance = useMutation({
    mutationFn: (data: { childId: string; date: string; timeSlotId: string; status: AttendanceStatus }) =>
      api.post<Attendance>('/attendance', data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) =>
      api.put<Attendance>(`/attendance/${id}`, data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
    },
  });

  const activeBookings = bookings?.data?.filter((b) => b.status === 'CONFIRMED') || [];
  const isLoading = loadingAttendance || loadingBookings;

  const handleMarkAttendance = async (childId: string, timeSlotId: string, status: AttendanceStatus) => {
    const existing = attendance?.find((a) => a.childId === childId && a.date === selectedDate);

    if (existing) {
      await updateAttendance.mutateAsync({
        id: existing.id,
        data: { status },
      });
    } else {
      await recordAttendance.mutateAsync({
        childId,
        date: selectedDate,
        timeSlotId,
        status,
      });
    }
  };

  const getChildAttendance = (childId: string) => {
    return attendance?.find((a) => a.childId === childId);
  };

  // Estadísticas del día
  const stats = {
    total: activeBookings.length,
    present: attendance?.filter((a) => a.status === 'PRESENT').length || 0,
    absent: attendance?.filter((a) => a.status === 'ABSENT').length || 0,
    late: attendance?.filter((a) => a.status === 'LATE').length || 0,
    excused: attendance?.filter((a) => a.status === 'EXCUSED').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control de Asistencia</h1>
        <p className="text-muted-foreground">
          Registra la asistencia diaria de los niños
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presentes</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.present}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ausentes</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.absent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tarde</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.late}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Justificados</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.excused}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Asistencia</CardTitle>
          <CardDescription>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : activeBookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay niños programados para este día
            </p>
          ) : (
            <div className="space-y-3">
              {activeBookings.map((booking) => {
                const childAttendance = getChildAttendance(booking.childId);
                const currentStatus = childAttendance?.status;

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {booking.child ? (
                          <span className="font-semibold text-primary text-sm">
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
                        {booking.slot && (
                          <p className="text-sm text-muted-foreground">
                            {booking.slot.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStatus && (
                        <Badge className={STATUS_COLORS[currentStatus]}>
                          {STATUS_TEXT[currentStatus]}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={currentStatus === 'PRESENT' ? 'default' : 'outline'}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleMarkAttendance(booking.childId, booking.slotId, 'PRESENT')}
                          disabled={recordAttendance.isPending || updateAttendance.isPending}
                        >
                          P
                        </Button>
                        <Button
                          size="sm"
                          variant={currentStatus === 'ABSENT' ? 'default' : 'outline'}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleMarkAttendance(booking.childId, booking.slotId, 'ABSENT')}
                          disabled={recordAttendance.isPending || updateAttendance.isPending}
                        >
                          A
                        </Button>
                        <Button
                          size="sm"
                          variant={currentStatus === 'LATE' ? 'default' : 'outline'}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => handleMarkAttendance(booking.childId, booking.slotId, 'LATE')}
                          disabled={recordAttendance.isPending || updateAttendance.isPending}
                        >
                          T
                        </Button>
                        <Button
                          size="sm"
                          variant={currentStatus === 'EXCUSED' ? 'default' : 'outline'}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleMarkAttendance(booking.childId, booking.slotId, 'EXCUSED')}
                          disabled={recordAttendance.isPending || updateAttendance.isPending}
                        >
                          J
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
