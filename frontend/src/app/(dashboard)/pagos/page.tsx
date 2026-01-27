'use client';

import { usePayments, useInitiatePayment } from '@/hooks/use-payments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { PaymentStatus } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const STATUS_TEXT: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
};

export default function PaymentsPage() {
  const { data: paymentsData, isLoading } = usePayments();
  const initiatePayment = useInitiatePayment();
  const [payingId, setPayingId] = useState<string | null>(null);

  const payments = paymentsData?.data || [];
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const completedPayments = payments.filter((p) => p.status !== 'PENDING');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const handlePay = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const result = await initiatePayment.mutateAsync(bookingId);
      window.location.href = result.url;
    } catch (error) {
      console.error('Error initiating payment:', error);
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Pagos</h1>
        <p className="text-muted-foreground">
          Historial y gestión de pagos
        </p>
      </div>

      {pendingPayments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">
              Pagos Pendientes
            </CardTitle>
            <CardDescription className="text-orange-700">
              Tienes {pendingPayments.length} pago(s) pendiente(s) por{' '}
              <strong>{formatCurrency(totalPending)}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {payment.booking?.child?.firstName} {payment.booking?.child?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {MONTHS[payment.periodMonth - 1]} {payment.periodYear} - {payment.booking?.slot?.name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                  <Button
                    onClick={() => handlePay(payment.bookingId)}
                    disabled={payingId === payment.bookingId}
                    className="whitespace-nowrap"
                  >
                    {payingId === payment.bookingId ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      'Pagar con WebPay'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Todos tus pagos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : completedPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay pagos en el historial
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {payment.booking?.child?.firstName} {payment.booking?.child?.lastName}
                      </p>
                      <Badge className={STATUS_COLORS[payment.status]}>
                        {STATUS_TEXT[payment.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {MONTHS[payment.periodMonth - 1]} {payment.periodYear} - {payment.booking?.slot?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    {payment.paidAt && (
                      <p className="text-sm text-muted-foreground">
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
