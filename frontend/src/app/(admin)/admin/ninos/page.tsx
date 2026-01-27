'use client';

import { useAdminChildren } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

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

export default function AdminChildrenPage() {
  const { data: childrenData, isLoading } = useAdminChildren();

  const children = childrenData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Niños</h1>
        <p className="text-muted-foreground">
          Administra todos los niños registrados en la plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Niños Registrados</CardTitle>
          <CardDescription>
            {children.length} niño(s) en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : children.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay niños registrados
            </p>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                        {calculateAge(child.birthDate)} años
                      </p>
                      {child.schoolName && (
                        <p className="text-sm text-muted-foreground">
                          {child.schoolName} {child.schoolGrade && `- ${child.schoolGrade}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    {child.guardian && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Apoderado: </span>
                        <span className="font-medium">
                          {child.guardian.firstName} {child.guardian.lastName}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Registrado: {formatDate(child.createdAt)}
                      </Badge>
                    </div>
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
