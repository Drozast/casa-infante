'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Briefcase, GraduationCap } from 'lucide-react';

interface SharedGuardian {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profession?: string;
  profileImage?: string;
  children: {
    id: string;
    firstName: string;
    lastName: string;
    schoolName?: string;
  }[];
}

export default function FamiliasPage() {
  const { accessToken } = useAuthStore();

  const { data: guardians, isLoading } = useQuery({
    queryKey: ['shared-guardians'],
    queryFn: () => api.get<SharedGuardian[]>('/users/shared-guardians', accessToken ?? undefined),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Cargando directorio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Directorio de Familias</h1>
        <p className="text-muted-foreground">
          Apoderados que han elegido compartir su información de contacto
        </p>
      </div>

      {!guardians || guardians.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aún no hay familias que hayan decidido compartir su información.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Puedes activar esta opción en tu perfil para aparecer en este directorio.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guardians.map((guardian) => (
            <Card key={guardian.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-700 font-semibold">
                    {guardian.firstName[0]}{guardian.lastName[0]}
                  </div>
                  <div>
                    <div>{guardian.firstName} {guardian.lastName}</div>
                    {guardian.profession && (
                      <div className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {guardian.profession}
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guardian.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${guardian.phone}`} className="text-lime-600 hover:underline">
                      {guardian.phone}
                    </a>
                  </div>
                )}

                {guardian.children.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Hijos:</p>
                    <div className="space-y-1">
                      {guardian.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-2 text-sm">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                            {child.firstName[0]}
                          </div>
                          <span>{child.firstName} {child.lastName}</span>
                          {child.schoolName && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {child.schoolName}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
