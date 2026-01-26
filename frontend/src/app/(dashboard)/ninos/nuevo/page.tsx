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
    rut: '',
    school: '',
    grade: '',
    allergies: '',
    medicalConditions: '',
    medications: '',
    dietaryRestrictions: '',
    emergencyContact: '',
    emergencyPhone: '',
    authorizedPickup: '',
    notes: '',
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
        rut: formData.rut || undefined,
        school: formData.school || undefined,
        grade: formData.grade || undefined,
        preferences: {
          allergies: formData.allergies || undefined,
          medicalConditions: formData.medicalConditions || undefined,
          medications: formData.medications || undefined,
          dietaryRestrictions: formData.dietaryRestrictions || undefined,
          emergencyContact: formData.emergencyContact || undefined,
          emergencyPhone: formData.emergencyPhone || undefined,
          authorizedPickup: formData.authorizedPickup || undefined,
          notes: formData.notes || undefined,
        },
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
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  placeholder="12.345.678-9"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="school">Colegio</Label>
                <Input
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Nombre del colegio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Curso</Label>
                <Input
                  id="grade"
                  name="grade"
                  value={formData.grade}
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
                placeholder="Lista de alergias conocidas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Condiciones Médicas</Label>
              <Input
                id="medicalConditions"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                placeholder="Condiciones médicas a considerar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Medicamentos</Label>
              <Input
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="Medicamentos que toma actualmente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Restricciones Alimentarias</Label>
              <Input
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                placeholder="Restricciones de alimentación"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
            <CardDescription>Personas autorizadas para emergencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Nombre de Contacto</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorizedPickup">Personas Autorizadas para Retirar</Label>
              <Input
                id="authorizedPickup"
                name="authorizedPickup"
                value={formData.authorizedPickup}
                onChange={handleChange}
                placeholder="Nombres de personas autorizadas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Cualquier información adicional..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
