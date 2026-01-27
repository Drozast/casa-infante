'use client';

import { useState } from 'react';
import { useAdminAttendance, useAdminBookings, useRecordAttendance, useUpdateAttendance } from '@/hooks/use-admin';
import { useTimeSlots } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AttendanceStatus } from '@/types';

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-800 hover:bg-green-200',
  ABSENT: 'bg-red-100 text-red-800 hover:bg-red-200',
  LATE: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  EXCUSED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
};

const STATUS_TEXT: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Ausente',
  LATE: 'Tarde',
  EXCUSED: 'Justificado',
};

export default function StaffAttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const { data: timeSlots } = useTimeSlots();
  const { data: bookings } = useAdminBookings();
  const { data: attendance, isLoading: loadingAttendance } = useAdminAttendance(selectedDate);
  const recordAttendance = useRecordAttendance();
  const updateAttendance = useUpdateAttendance();

  const dayOfWeek = new Date(selectedDate).getDay();

  const filteredBookings = bookings?.data?.filter((booking) => {
    if (booking.status !== 'CONFIRMED') return false;
    if (selectedSlot && booking.slotId !== selectedSlot) return false;
    if (!booking.slot?.daysOfWeek?.includes(dayOfWeek)) return false;
    return true;
  }) || [];

  const getAttendanceRecord = (childId: string, slotId: string) => {
    return attendance?.find(
      (a) => a.childId === childId && a.timeSlotId === slotId
    );
  };

  const handleStatusChange = async (
    childId: string,
    slotId: string,
    status: AttendanceStatus
  ) => {
    const existing = getAttendanceRecord(childId, slotId);

    try {
      if (existing) {
        await updateAttendance.mutateAsync({
          id: existing.id,
          data: { status },
        });
      } else {
        await recordAttendance.mutateAsync({
          childId,
          date: selectedDate,
          timeSlotId: slotId,
          status,
        });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const presentCount = filteredBookings.filter((b) => {
    const record = getAttendanceRecord(b.childId, b.slotId);
    return record?.status === 'PRESENT';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control de Asistencia</h1>
        <p className="text-muted-foreground">
          Registra la asistencia diaria de los niños
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Jornada</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {timeSlots?.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Esperados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredBookings.length - presentCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Niños</CardTitle>
          <CardDescription>
            {dayOfWeek === 0 || dayOfWeek === 6
              ? 'Fin de semana - No hay actividad'
              : `${filteredBookings.length} niño(s) esperado(s) para hoy`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAttendance ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : dayOfWeek === 0 || dayOfWeek === 6 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay actividad programada para fin de semana
            </p>
          ) : filteredBookings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay niños con reserva para esta fecha/jornada
            </p>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => {
                const record = getAttendanceRecord(booking.childId, booking.slotId);
                const currentStatus = record?.status;

                return (
                  <div
                    key={`${booking.id}-${booking.childId}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary text-sm">
                          {booking.child?.firstName?.[0]}
                          {booking.child?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {booking.child?.firstName} {booking.child?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.slot?.name} · {booking.child?.schoolName || 'Sin colegio'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map(
                        (status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant="ghost"
                            className={`${STATUS_COLORS[status]} ${
                              currentStatus === status ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                            onClick={() =>
                              handleStatusChange(booking.childId, booking.slotId, status)
                            }
                          >
                            {STATUS_TEXT[status]}
                          </Button>
                        )
                      )}
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
