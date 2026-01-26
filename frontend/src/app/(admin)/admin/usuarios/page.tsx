'use client';

import { useAdminUsers, useUpdateUserRole } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { UserRole } from '@/types';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  GUARDIAN: 'bg-blue-100 text-blue-800',
  STAFF: 'bg-green-100 text-green-800',
};

const ROLE_TEXT: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  GUARDIAN: 'Apoderado',
  STAFF: 'Staff',
};

export default function AdminUsersPage() {
  const { data: usersData, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  const users = usersData?.data || [];

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setChangingRoleId(userId);
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra los usuarios de la plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            {users.length} usuario(s) en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrado: {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={ROLE_COLORS[user.role]}>
                      {ROLE_TEXT[user.role]}
                    </Badge>
                    {user.role !== 'ADMIN' && (
                      <div className="flex gap-2">
                        {user.role !== 'STAFF' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(user.id, 'STAFF')}
                            disabled={changingRoleId === user.id}
                          >
                            Hacer Staff
                          </Button>
                        )}
                        {user.role !== 'GUARDIAN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(user.id, 'GUARDIAN')}
                            disabled={changingRoleId === user.id}
                          >
                            Hacer Apoderado
                          </Button>
                        )}
                      </div>
                    )}
                    {!user.emailVerified && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Email no verificado
                      </Badge>
                    )}
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
