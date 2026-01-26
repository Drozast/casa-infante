'use client';

import { useState } from 'react';
import { useAdminWorkshops, useCreateWorkshop, useUpdateWorkshop } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WorkshopDay } from '@/types';

const DAY_TEXT: Record<WorkshopDay, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
};

export default function AdminWorkshopsPage() {
  const { data: workshops, isLoading } = useAdminWorkshops();
  const createWorkshop = useCreateWorkshop();
  const updateWorkshop = useUpdateWorkshop();

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dayOfWeek: 'TUESDAY' as WorkshopDay,
    startTime: '15:00',
    endTime: '16:30',
    maxCapacity: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWorkshop.mutateAsync(formData);
      setIsCreating(false);
      setFormData({
        name: '',
        description: '',
        dayOfWeek: 'TUESDAY',
        startTime: '15:00',
        endTime: '16:30',
        maxCapacity: 10,
      });
    } catch (error) {
      console.error('Error creating workshop:', error);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateWorkshop.mutateAsync({
        id,
        data: { isActive: !currentActive },
      });
    } catch (error) {
      console.error('Error updating workshop:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Talleres</h1>
          <p className="text-muted-foreground">
            Administra los talleres extracurriculares
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancelar' : 'Nuevo Taller'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Taller</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Inglés"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Día</Label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {Object.entries(DAY_TEXT).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción del taller..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora Inicio</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Fin</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
                  <Input
                    id="maxCapacity"
                    name="maxCapacity"
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={createWorkshop.isPending}>
                {createWorkshop.isPending ? 'Creando...' : 'Crear Taller'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Talleres Existentes</CardTitle>
          <CardDescription>
            {workshops?.length || 0} taller(es) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : !workshops || workshops.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay talleres registrados
            </p>
          ) : (
            <div className="space-y-4">
              {workshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{workshop.name}</p>
                      <Badge variant={workshop.isActive ? 'default' : 'secondary'}>
                        {workshop.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {DAY_TEXT[workshop.dayOfWeek]} · {workshop.startTime} - {workshop.endTime}
                    </p>
                    {workshop.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {workshop.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Capacidad: {workshop.maxCapacity}
                    </span>
                    <Button
                      size="sm"
                      variant={workshop.isActive ? 'outline' : 'default'}
                      onClick={() => toggleActive(workshop.id, workshop.isActive)}
                    >
                      {workshop.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
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
