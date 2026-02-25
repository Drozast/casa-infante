'use client';

import { useState } from 'react';
import { useAdminChildren, useTimeSlots, useCreateBooking } from '@/hooks/use-admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, User, Clock, FileText } from 'lucide-react';

interface AddBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSuccess?: () => void;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function AddBookingModal({ open, onOpenChange, selectedDate, onSuccess }: AddBookingModalProps) {
  const [childId, setChildId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const { data: childrenData, isLoading: loadingChildren } = useAdminChildren();
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots();
  const createBooking = useCreateBooking();

  const children = childrenData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!childId || !slotId || !selectedDate) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await createBooking.mutateAsync({
        childId,
        slotId,
        date: selectedDate.toISOString().split('T')[0],
        passType: 'DAILY',
        notes: notes || undefined,
      });

      // Reset form
      setChildId('');
      setSlotId('');
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setError('Error al crear la reserva. Verifica que no exista una reserva duplicada.');
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-lime-600" />
            Agregar Reserva
          </DialogTitle>
          <DialogDescription>
            {selectedDate && (
              <>Crear reserva para el {formatDate(selectedDate)}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleccionar niño */}
          <div className="space-y-2">
            <Label htmlFor="child" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Niño/a
            </Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger id="child">
                <SelectValue placeholder={loadingChildren ? "Cargando..." : "Selecciona un niño"} />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                    {child.schoolName && (
                      <span className="text-muted-foreground ml-2">
                        ({child.schoolName})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleccionar horario */}
          <div className="space-y-2">
            <Label htmlFor="slot" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horario
            </Label>
            <Select value={slotId} onValueChange={setSlotId}>
              <SelectTrigger id="slot">
                <SelectValue placeholder={loadingSlots ? "Cargando..." : "Selecciona un horario"} />
              </SelectTrigger>
              <SelectContent>
                {timeSlots?.filter(s => s.isActive).map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.name} ({slot.startTime} - {slot.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notas opcionales */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas (opcional)
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Niño extra, traerá colación"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-lime-600 hover:bg-lime-700"
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? 'Creando...' : 'Crear Reserva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
