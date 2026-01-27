'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChildren } from '@/hooks/use-children';
import { useTimeSlots, usePricingConfigs, useCreateBooking, useCalculatePrice } from '@/hooks/use-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
];

export default function NewBookingPage() {
  const router = useRouter();
  const { data: childrenData, isLoading: loadingChildren } = useChildren();
  const { data: timeSlots, isLoading: loadingTimeSlots } = useTimeSlots();
  const { data: pricingConfigs } = usePricingConfigs();
  const createBooking = useCreateBooking();
  const calculatePrice = useCalculatePrice();

  const children = childrenData?.data || [];

  const [formData, setFormData] = useState({
    childId: '',
    slotId: '',
    date: '',
    selectedDays: [] as number[],
  });

  const [priceInfo, setPriceInfo] = useState<{
    monthlyPrice: number;
    pricePerSession: number;
  } | null>(null);

  const [error, setError] = useState('');

  const selectedTimeSlot = timeSlots?.find((ts) => ts.id === formData.slotId);

  useEffect(() => {
    if (formData.slotId && formData.selectedDays.length > 0) {
      calculatePrice.mutate(
        {
          slotId: formData.slotId,
          weeklyFrequency: formData.selectedDays.length,
        },
        {
          onSuccess: (data) => {
            setPriceInfo(data);
          },
        }
      );
    } else {
      setPriceInfo(null);
    }
  }, [formData.slotId, formData.selectedDays]);

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day].sort(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.childId || !formData.slotId || !formData.date || formData.selectedDays.length === 0) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await createBooking.mutateAsync({
        childId: formData.childId,
        slotId: formData.slotId,
        date: formData.date,
        weeklyFrequency: formData.selectedDays.length,
      });
      router.push('/reservas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reserva');
    }
  };

  if (loadingChildren || loadingTimeSlots) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <Card className="animate-pulse">
          <CardContent className="py-12">
            <div className="h-40 bg-gray-100 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-8 w-8 text-orange-600"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Primero registra un niño</h3>
            <p className="text-muted-foreground text-center mb-4">
              Para crear una reserva necesitas tener al menos un niño registrado
            </p>
            <Button asChild>
              <Link href="/ninos/nuevo">Registrar niño</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/reservas">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Reserva</h1>
          <p className="text-muted-foreground">
            Selecciona el niño, horario y días de asistencia
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Niño</CardTitle>
            <CardDescription>Elige el niño para esta reserva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, childId: child.id }))}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left ${
                    formData.childId === child.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary">
                      {child.firstName[0]}
                      {child.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {child.firstName} {child.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {child.schoolName || 'Sin colegio'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Horario</CardTitle>
            <CardDescription>Elige la jornada de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {timeSlots?.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, slotId: slot.id }))}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left ${
                    formData.slotId === slot.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <p className="font-medium">{slot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <p className="font-medium">{slot.maxCapacity} niños</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Días de Asistencia</CardTitle>
            <CardDescription>
              Selecciona los días que asistirá tu niño
              {pricingConfigs && (
                <span className="block mt-1">
                  Precios: {pricingConfigs.map((p) => `${p.weeklyFrequency}x = ${formatCurrency(p.pricePerSession)}/sesión`).join(' | ')}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {DAYS.map((day) => {
                const isAvailable = selectedTimeSlot?.daysOfWeek.includes(day.value) ?? true;
                const isSelected = formData.selectedDays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => isAvailable && handleDayToggle(day.value)}
                    disabled={!isAvailable}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      !isAvailable
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        : isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium text-sm">{day.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fecha de Inicio</CardTitle>
            <CardDescription>Desde cuándo comenzará la reserva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de inicio</Label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>

        {priceInfo && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Resumen de Precio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {formData.selectedDays.length} día(s) por semana
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Precio por sesión: {formatCurrency(priceInfo.pricePerSession)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total mensual</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(priceInfo.monthlyPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createBooking.isPending || !priceInfo}
          >
            {createBooking.isPending ? 'Creando...' : 'Crear Reserva'}
          </Button>
        </div>
      </form>
    </div>
  );
}
