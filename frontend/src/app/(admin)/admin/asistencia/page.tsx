'use client';

import { useState } from 'react';
import { useAdminAttendance, useRecordAttendance, useUpdateAttendance } from '@/hooks/use-admin';
import { useAdminChildren, useAdminBookings } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AttendanceStatus } from '@/types';

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

export default function AdminAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { data: attendance, isLoading } = useAdminAttendance(selectedDate);
  const { data: bookingsData } = useAdminBookings();
  const recordAttendance = useRecordAttendance();
  const updateAttendance = useUpdateAttendance();

  const bookings = bookingsData?.data || [];
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED');

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
          <CardTitle>Asistencia del Día</CardTitle>
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
              No hay reservas activas para registrar asistencia
            </p>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => {
                const childAttendance = getChildAttendance(booking.childId);
                const currentStatus = childAttendance?.status;

                return (
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
                            {booking.timeSlot.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentStatus && (
                        <Badge className={STATUS_COLORS[currentStatus]}>
                          {STATUS_TEXT[currentStatus]}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map((status) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={currentStatus === status ? 'default' : 'outline'}
                            onClick={() => handleMarkAttendance(booking.childId, booking.timeSlotId, status)}
                            disabled={recordAttendance.isPending || updateAttendance.isPending}
                          >
                            {STATUS_TEXT[status]}
                          </Button>
                        ))}
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
