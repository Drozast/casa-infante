'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateChild } from '@/hooks/use-children';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function NewChildPage() {
  const router = useRouter();
  const createChild = useCreateChild();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    schoolName: '',
    schoolGrade: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await createChild.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        schoolName: formData.schoolName || undefined,
        schoolGrade: formData.schoolGrade || undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map((a) => a.trim()) : undefined,
        emergencyContactName: formData.emergencyContactName || 'No especificado',
        emergencyContactPhone: formData.emergencyContactPhone || 'No especificado',
        emergencyContactRelation: formData.emergencyContactRelation || 'No especificado',
      });
      router.push('/ninos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar niño');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/ninos">
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
          <h1 className="text-2xl font-bold tracking-tight">Agregar Niño</h1>
          <p className="text-muted-foreground">
            Completa la información del nuevo niño
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos personales del niño</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nombre del niño"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Apellido del niño"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Colegio</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  placeholder="Nombre del colegio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolGrade">Curso</Label>
                <Input
                  id="schoolGrade"
                  name="schoolGrade"
                  value={formData.schoolGrade}
                  onChange={handleChange}
                  placeholder="Ej: 3° Básico"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Salud</CardTitle>
            <CardDescription>Datos médicos importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Separar con comas: Nueces, Maní, etc."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia *</CardTitle>
            <CardDescription>Persona autorizada para emergencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Nombre del Contacto *</Label>
              <Input
                id="emergencyContactName"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Teléfono *</Label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">Relación *</Label>
                <Input
                  id="emergencyContactRelation"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  placeholder="Ej: Padre, Madre, Tío"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
            disabled={createChild.isPending}
          >
            {createChild.isPending ? 'Guardando...' : 'Guardar Niño'}
          </Button>
        </div>
      </form>
    </div>
  );
}
