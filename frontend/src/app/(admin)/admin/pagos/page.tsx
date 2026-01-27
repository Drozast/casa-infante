'use client';

import { useAdminPayments } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/types';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const STATUS_TEXT: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  COMPLETED: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
};

export default function AdminPaymentsPage() {
  const { data: paymentsData, isLoading } = useAdminPayments();

  const payments = paymentsData?.data || [];

  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Pagos</h1>
        <p className="text-muted-foreground">
          Administra todos los pagos de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pagos</CardDescription>
            <CardTitle className="text-2xl">{payments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Recaudado</CardDescription>
            <CardTitle className="text-2xl text-green-600">{formatCurrency(totalPaid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendiente</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{formatCurrency(totalPending)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>
            {payments.length} pago(s) en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No hay pagos registrados
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div>
                    {payment.booking?.child && (
                      <p className="font-medium">
                        {payment.booking.child.firstName} {payment.booking.child.lastName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Creado: {formatDate(payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <span className="text-lg font-bold">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                    <Badge className={STATUS_COLORS[payment.status]}>
                      {STATUS_TEXT[payment.status]}
                    </Badge>
                    {payment.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        Pagado: {formatDate(payment.paidAt)}
                      </p>
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
