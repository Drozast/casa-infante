'use client';

import { useAdminStats, useAdminPayments, useAdminBookings, useAdminChildren } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function AdminReportsPage() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: paymentsData, isLoading: loadingPayments } = useAdminPayments();
  const { data: bookingsData, isLoading: loadingBookings } = useAdminBookings();
  const { data: childrenData, isLoading: loadingChildren } = useAdminChildren();

  const payments = paymentsData?.data || [];
  const bookings = bookingsData?.data || [];
  const children = childrenData?.data || [];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calcular estadísticas
  const monthlyPayments = payments.filter((p) => {
    const d = new Date(p.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const paidThisMonth = monthlyPayments.filter((p) => p.status === 'COMPLETED');
  const pendingThisMonth = monthlyPayments.filter((p) => p.status === 'PENDING');

  const totalPaidThisMonth = paidThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPendingThisMonth = pendingThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  const isLoading = loadingStats || loadingPayments || loadingBookings || loadingChildren;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Resumen y estadísticas del sistema
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Usuarios</CardDescription>
                <CardTitle className="text-3xl">{stats?.totalUsers || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Niños</CardDescription>
                <CardTitle className="text-3xl">{children.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reservas Activas</CardDescription>
                <CardTitle className="text-3xl">{activeBookings.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Asistencia Hoy</CardDescription>
                <CardTitle className="text-3xl">{stats?.todayAttendance || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen Financiero - {MONTHS[currentMonth]} {currentYear}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Pagos Recibidos</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaidThisMonth)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cantidad</p>
                    <p className="text-xl font-semibold">{paidThisMonth.length}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendingThisMonth)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cantidad</p>
                    <p className="text-xl font-semibold">{pendingThisMonth.length}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Esperado</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(totalPaidThisMonth + totalPendingThisMonth)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">% Cobrado</p>
                    <p className="text-xl font-semibold">
                      {monthlyPayments.length > 0
                        ? Math.round((paidThisMonth.length / monthlyPayments.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Reservas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const byStatus = {
                    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
                    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
                    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
                  };
                  const total = bookings.length || 1;

                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confirmadas</span>
                          <span className="font-medium">{byStatus.CONFIRMED}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(byStatus.CONFIRMED / total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pendientes</span>
                          <span className="font-medium">{byStatus.PENDING}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ width: `${(byStatus.PENDING / total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Canceladas</span>
                          <span className="font-medium">{byStatus.CANCELLED}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${(byStatus.CANCELLED / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frecuencia de Asistencia Semanal</CardTitle>
              <CardDescription>Distribución de días por semana en reservas activas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((freq) => {
                  const count = activeBookings.filter((b) => b.weeklyFrequency === freq).length;
                  return (
                    <div key={freq} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{count}</p>
                      <p className="text-sm text-muted-foreground">{freq} día{freq > 1 ? 's' : ''}/sem</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
