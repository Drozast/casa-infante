'use client';

import { useParams } from 'next/navigation';
import { useChild, useUpdateChild } from '@/hooks/use-children';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export default function ChildDetailPage() {
  const params = useParams();
  const childId = params.id as string;
  const { data: child, isLoading } = useChild(childId);
  const updateChild = useUpdateChild();

  const [isEditing, setIsEditing] = useState(false);
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

  const startEditing = () => {
    if (child) {
      setFormData({
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate.split('T')[0],
        schoolName: child.schoolName || '',
        schoolGrade: child.schoolGrade || '',
        allergies: child.allergies?.join(', ') || '',
        emergencyContactName: child.emergencyContactName || '',
        emergencyContactPhone: child.emergencyContactPhone || '',
        emergencyContactRelation: child.emergencyContactRelation || '',
      });
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await updateChild.mutateAsync({
        id: childId,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          schoolName: formData.schoolName || undefined,
          schoolGrade: formData.schoolGrade || undefined,
          allergies: formData.allergies ? formData.allergies.split(',').map((a) => a.trim()) : undefined,
          emergencyContactName: formData.emergencyContactName || undefined,
          emergencyContactPhone: formData.emergencyContactPhone || undefined,
          emergencyContactRelation: formData.emergencyContactRelation || undefined,
        },
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-100 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Niño no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          El niño que buscas no existe o no tienes acceso
        </p>
        <Button asChild>
          <Link href="/ninos">Volver a Mis Niños</Link>
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
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
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Niño</h1>
            <p className="text-muted-foreground">
              Modifica la información de {child.firstName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolGrade">Curso</Label>
                  <Input
                    id="schoolGrade"
                    name="schoolGrade"
                    value={formData.schoolGrade}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Salud</CardTitle>
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
              <CardTitle>Contacto de Emergencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Nombre del Contacto</Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Teléfono</Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Relación</Label>
                  <Input
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleChange}
                    placeholder="Ej: Padre, Madre, Tío"
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
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={updateChild.isPending}>
              {updateChild.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary text-xl">
                {child.firstName[0]}
                {child.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {child.firstName} {child.lastName}
              </h1>
              <p className="text-muted-foreground">
                {calculateAge(child.birthDate)} años
              </p>
            </div>
          </div>
        </div>
        <Button onClick={startEditing}>Editar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Datos básicos del niño</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
              <p className="font-medium">{formatDate(child.birthDate)}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {child.schoolName && (
              <div>
                <p className="text-sm text-muted-foreground">Colegio</p>
                <p className="font-medium">{child.schoolName}</p>
              </div>
            )}
            {child.schoolGrade && (
              <div>
                <p className="text-sm text-muted-foreground">Curso</p>
                <Badge variant="outline">{child.schoolGrade}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Salud</CardTitle>
          <CardDescription>Datos médicos importantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {child.allergies?.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">Alergias</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {child.allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No hay información de salud registrada
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto de Emergencia</CardTitle>
          <CardDescription>Persona autorizada para emergencias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {child.emergencyContactName ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Contacto</p>
                  <p className="font-medium">{child.emergencyContactName}</p>
                </div>
                {child.emergencyContactPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{child.emergencyContactPhone}</p>
                  </div>
                )}
              </div>
              {child.emergencyContactRelation && (
                <div>
                  <p className="text-sm text-muted-foreground">Relación</p>
                  <p className="font-medium">{child.emergencyContactRelation}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              No hay contactos de emergencia registrados
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
