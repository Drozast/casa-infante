'use client';

import { useState, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { EventClickArg, DatesSetArg, EventContentArg } from '@fullcalendar/core';
import { useCalendarEvents, useCheckIn, useDeleteAttendance, useUpdateAttendanceDetails, useAdminChildren, type CalendarEvent } from '@/hooks/use-admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Car, UtensilsCrossed, Clock, Trash2, Plus } from 'lucide-react';

export default function AdminCalendarioPage() {
  const today = new Date();
  const [currentRange, setCurrentRange] = useState({
    from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
    to: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddingAttendance, setIsAddingAttendance] = useState(false);
  const [newAttendanceChildId, setNewAttendanceChildId] = useState('');
  const [newBillingType, setNewBillingType] = useState<'PREPAID' | 'POSTPAID'>('POSTPAID');
  const [newHasLunch, setNewHasLunch] = useState(false);
  const [newHasPickup, setNewHasPickup] = useState(false);
  const [newPickupTime, setNewPickupTime] = useState('');

  const { data: events, isLoading, refetch } = useCalendarEvents(currentRange.from, currentRange.to);
  const { data: childrenData } = useAdminChildren();
  const children = childrenData?.data || [];

  const checkIn = useCheckIn();
  const deleteAttendance = useDeleteAttendance();
  const updateAttendance = useUpdateAttendanceDetails();
  const { toast } = useToast();

  // Manejo de cambio de rango de fechas
  const handleDatesSet = useCallback((dateInfo: DatesSetArg) => {
    const from = dateInfo.start.toISOString().split('T')[0];
    const to = dateInfo.end.toISOString().split('T')[0];
    setCurrentRange({ from, to });
  }, []);

  // Click en un evento existente
  const handleEventClick = useCallback((info: EventClickArg) => {
    const eventData = events?.find(e => e.id === info.event.id);
    if (eventData) {
      setSelectedEvent(eventData);
    }
  }, [events]);

  // Click en una fecha vacía
  const handleDateClick = useCallback((info: DateClickArg) => {
    const dateObj = new Date(info.dateStr + 'T12:00:00');

    // Verificar si es viernes o domingo
    if (dateObj.getDay() === 5) {
      toast({ title: 'Viernes cerrado', description: 'Casa Infante no abre los viernes', variant: 'destructive' });
      return;
    }
    if (dateObj.getDay() === 0) {
      toast({ title: 'Domingo cerrado', description: 'Casa Infante no abre los domingos', variant: 'destructive' });
      return;
    }

    setSelectedDate(info.dateStr);
    setIsAddingAttendance(true);
    setNewAttendanceChildId('');
    setNewBillingType('POSTPAID');
    setNewHasLunch(false);
    setNewHasPickup(false);
    setNewPickupTime('');
  }, [toast]);

  // Crear nueva asistencia
  const handleCreateAttendance = async () => {
    if (!newAttendanceChildId || !selectedDate) return;

    try {
      await checkIn.mutateAsync({
        childId: newAttendanceChildId,
        date: selectedDate,
        billingType: newBillingType,
        hasLunch: newHasLunch,
        hasPickup: newHasPickup,
        pickupTime: newHasPickup ? newPickupTime : undefined,
      });
      toast({ title: 'Asistencia registrada' });
      setIsAddingAttendance(false);
      setSelectedDate(null);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Eliminar asistencia
  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm('¿Eliminar este registro de asistencia?')) return;

    try {
      await deleteAttendance.mutateAsync(selectedEvent.id);
      toast({ title: 'Asistencia eliminada' });
      setSelectedEvent(null);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Actualizar asistencia (lunch/pickup)
  const handleUpdateEvent = async (updates: { hasLunch?: boolean; hasPickup?: boolean; pickupTime?: string }) => {
    if (!selectedEvent) return;

    try {
      await updateAttendance.mutateAsync({
        id: selectedEvent.id,
        data: updates,
      });
      toast({ title: 'Asistencia actualizada' });
      refetch();
      // Actualizar estado local
      setSelectedEvent({
        ...selectedEvent,
        extendedProps: {
          ...selectedEvent.extendedProps,
          ...updates,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  // Filtrar niños que ya tienen asistencia en la fecha seleccionada
  const availableChildren = useMemo(() => {
    if (!selectedDate || !events) return children;
    const childrenWithAttendance = new Set(
      events
        .filter(e => e.start === selectedDate)
        .map(e => e.extendedProps.childId)
    );
    return children.filter(c => !childrenWithAttendance.has(c.id));
  }, [children, events, selectedDate]);

  const getBillingLabel = (type: string) => {
    switch (type) {
      case 'PREPAID': return 'Pagado';
      case 'POSTPAID': return 'Por cobrar';
      case 'BILLED': return 'Cobrado';
      default: return type;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Calendario de Asistencias</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-400" />
            <span>Pagado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-400" />
            <span>Por cobrar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-400" />
            <span>Cobrado</span>
          </div>
          <div className="flex items-center gap-1">
            <UtensilsCrossed className="h-3 w-3 text-orange-500" />
            <span>Almuerza</span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3 text-purple-500" />
            <span>Traslado</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-lg">Cargando calendario...</div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,listMonth',
            }}
            events={events || []}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            height="100%"
            dayMaxEvents={4}
            moreLinkText={(n) => `+${n} más`}
            eventContent={(eventInfo: EventContentArg) => {
              const props = eventInfo.event.extendedProps as CalendarEvent['extendedProps'];
              return (
                <div className="flex items-center gap-1 px-1 py-0.5 text-xs overflow-hidden">
                  <span className="truncate font-medium">{eventInfo.event.title}</span>
                  {props.hasLunch && <UtensilsCrossed className="h-3 w-3 text-orange-600 flex-shrink-0" />}
                  {props.hasPickup && <Car className="h-3 w-3 text-purple-600 flex-shrink-0" />}
                </div>
              );
            }}
            dayCellClassNames={(arg) => {
              const day = arg.date.getDay();
              if (day === 5) return 'bg-gray-100 opacity-60'; // Viernes
              if (day === 0) return 'bg-gray-50 opacity-60'; // Domingo
              return '';
            }}
          />
        )}
      </div>

      {/* Dialog para ver/editar evento existente */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.extendedProps.childName}
              <span className={`text-xs px-2 py-0.5 rounded ${
                selectedEvent?.extendedProps.billingType === 'PREPAID' ? 'bg-green-100 text-green-700' :
                selectedEvent?.extendedProps.billingType === 'POSTPAID' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedEvent && getBillingLabel(selectedEvent.extendedProps.billingType)}
              </span>
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && new Date(selectedEvent.start + 'T12:00:00').toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              {/* Hora de entrada/salida */}
              {selectedEvent.extendedProps.checkInTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Entrada: {new Date(selectedEvent.extendedProps.checkInTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    {selectedEvent.extendedProps.checkOutTime && (
                      <> - Salida: {new Date(selectedEvent.extendedProps.checkOutTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </span>
                </div>
              )}

              {/* Toggle Almuerzo */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Almuerza</span>
                </div>
                <button
                  onClick={() => handleUpdateEvent({ hasLunch: !selectedEvent.extendedProps.hasLunch })}
                  disabled={updateAttendance.isPending}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedEvent.extendedProps.hasLunch ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    selectedEvent.extendedProps.hasLunch ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Toggle Traslado */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Traslado</span>
                </div>
                <button
                  onClick={() => handleUpdateEvent({ hasPickup: !selectedEvent.extendedProps.hasPickup })}
                  disabled={updateAttendance.isPending}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedEvent.extendedProps.hasPickup ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    selectedEvent.extendedProps.hasPickup ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Hora de traslado */}
              {selectedEvent.extendedProps.hasPickup && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Hora del traslado:</label>
                  <input
                    type="time"
                    value={selectedEvent.extendedProps.pickupTime || ''}
                    onChange={(e) => handleUpdateEvent({ pickupTime: e.target.value })}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                </div>
              )}

              {/* Notas */}
              {selectedEvent.extendedProps.notes && (
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">{selectedEvent.extendedProps.notes}</p>
                </div>
              )}

              {/* Eliminar (solo si no está cobrado) */}
              {selectedEvent.extendedProps.billingType !== 'BILLED' && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={deleteAttendance.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Asistencia
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para agregar nueva asistencia */}
      <Dialog open={isAddingAttendance} onOpenChange={(open) => !open && setIsAddingAttendance(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Asistencia
            </DialogTitle>
            <DialogDescription>
              {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Selector de niño */}
            <div>
              <label className="text-sm font-medium">Seleccionar niño</label>
              <select
                value={newAttendanceChildId}
                onChange={(e) => setNewAttendanceChildId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="">-- Seleccionar --</option>
                {availableChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
              {availableChildren.length === 0 && (
                <p className="text-sm text-yellow-600 mt-1">Todos los niños ya tienen asistencia este día</p>
              )}
            </div>

            {/* Tipo de cobro */}
            <div>
              <label className="text-sm font-medium">Tipo de pago</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setNewBillingType('PREPAID')}
                  className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                    newBillingType === 'PREPAID'
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Pagado
                </button>
                <button
                  type="button"
                  onClick={() => setNewBillingType('POSTPAID')}
                  className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                    newBillingType === 'POSTPAID'
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Por cobrar
                </button>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHasLunch}
                  onChange={(e) => setNewHasLunch(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Almuerza</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHasPickup}
                  onChange={(e) => setNewHasPickup(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Car className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Traslado</span>
              </label>
            </div>

            {/* Hora de traslado */}
            {newHasPickup && (
              <div>
                <label className="text-sm font-medium">Hora del traslado</label>
                <input
                  type="time"
                  value={newPickupTime}
                  onChange={(e) => setNewPickupTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleCreateAttendance}
              disabled={!newAttendanceChildId || checkIn.isPending}
            >
              {checkIn.isPending ? 'Registrando...' : 'Registrar Asistencia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
