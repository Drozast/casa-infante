'use client';

import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const childId = params.id as string;
  const { data: child, isLoading } = useChild(childId);
  const updateChild = useUpdateChild();

  const [isEditing, setIsEditing] = useState(false);
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

  const startEditing = () => {
    if (child) {
      setFormData({
        firstName: child.firstName,
        lastName: child.lastName,
        birthDate: child.birthDate.split('T')[0],
        rut: child.rut || '',
        school: child.school || '',
        grade: child.grade || '',
        allergies: child.preferences?.allergies || '',
        medicalConditions: child.preferences?.medicalConditions || '',
        medications: child.preferences?.medications || '',
        dietaryRestrictions: child.preferences?.dietaryRestrictions || '',
        emergencyContact: child.preferences?.emergencyContact || '',
        emergencyPhone: child.preferences?.emergencyPhone || '',
        authorizedPickup: child.preferences?.authorizedPickup || '',
        notes: child.preferences?.notes || '',
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Curso</Label>
                  <Input
                    id="grade"
                    name="grade"
                    value={formData.grade}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Condiciones Médicas</Label>
                <Input
                  id="medicalConditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Medicamentos</Label>
                <Input
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietaryRestrictions">Restricciones Alimentarias</Label>
                <Input
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto de Emergencia</CardTitle>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorizedPickup">Personas Autorizadas</Label>
                <Input
                  id="authorizedPickup"
                  name="authorizedPickup"
                  value={formData.authorizedPickup}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            {child.rut && (
              <div>
                <p className="text-sm text-muted-foreground">RUT</p>
                <p className="font-medium">{child.rut}</p>
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {child.school && (
              <div>
                <p className="text-sm text-muted-foreground">Colegio</p>
                <p className="font-medium">{child.school}</p>
              </div>
            )}
            {child.grade && (
              <div>
                <p className="text-sm text-muted-foreground">Curso</p>
                <Badge variant="outline">{child.grade}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {child.preferences && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Información de Salud</CardTitle>
              <CardDescription>Datos médicos importantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {child.preferences.allergies && (
                <div>
                  <p className="text-sm text-muted-foreground">Alergias</p>
                  <Badge variant="destructive" className="mt-1">
                    {child.preferences.allergies}
                  </Badge>
                </div>
              )}
              {child.preferences.medicalConditions && (
                <div>
                  <p className="text-sm text-muted-foreground">Condiciones Médicas</p>
                  <p className="font-medium">{child.preferences.medicalConditions}</p>
                </div>
              )}
              {child.preferences.medications && (
                <div>
                  <p className="text-sm text-muted-foreground">Medicamentos</p>
                  <p className="font-medium">{child.preferences.medications}</p>
                </div>
              )}
              {child.preferences.dietaryRestrictions && (
                <div>
                  <p className="text-sm text-muted-foreground">Restricciones Alimentarias</p>
                  <p className="font-medium">{child.preferences.dietaryRestrictions}</p>
                </div>
              )}
              {!child.preferences.allergies &&
                !child.preferences.medicalConditions &&
                !child.preferences.medications &&
                !child.preferences.dietaryRestrictions && (
                  <p className="text-muted-foreground">
                    No hay información de salud registrada
                  </p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto de Emergencia</CardTitle>
              <CardDescription>Personas autorizadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {child.preferences.emergencyContact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contacto</p>
                    <p className="font-medium">{child.preferences.emergencyContact}</p>
                  </div>
                )}
                {child.preferences.emergencyPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{child.preferences.emergencyPhone}</p>
                  </div>
                )}
              </div>
              {child.preferences.authorizedPickup && (
                <div>
                  <p className="text-sm text-muted-foreground">Personas Autorizadas para Retirar</p>
                  <p className="font-medium">{child.preferences.authorizedPickup}</p>
                </div>
              )}
              {child.preferences.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="font-medium">{child.preferences.notes}</p>
                </div>
              )}
              {!child.preferences.emergencyContact &&
                !child.preferences.emergencyPhone &&
                !child.preferences.authorizedPickup && (
                  <p className="text-muted-foreground">
                    No hay contactos de emergencia registrados
                  </p>
                )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
