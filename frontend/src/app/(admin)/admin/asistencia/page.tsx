'use client';

import { useState } from 'react';
import {
  useAdminChildren,
  useCheckIn,
  useDeleteAttendance,
  useMonthlyCalendar,
  usePendingBillings,
  useGenerateMonthlyBilling,
  useMonthlyBillings,
  useMarkBillingPaid,
} from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, CheckCircle, Clock, DollarSign, Plus, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function AdminAttendancePage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [isAddingAttendance, setIsAddingAttendance] = useState(false);

  const { data: childrenData, isLoading: loadingChildren } = useAdminChildren();
  const children = childrenData?.data || [];

  const { data: calendarData, isLoading: loadingCalendar } = useMonthlyCalendar(
    selectedChildId || '',
    selectedYear,
    selectedMonth
  );

  const { data: pendingData } = usePendingBillings(selectedYear, selectedMonth);
  const { data: billingsData } = useMonthlyBillings(undefined, selectedMonth, selectedYear);

  const checkIn = useCheckIn();
  const deleteAttendance = useDeleteAttendance();
  const generateBilling = useGenerateMonthlyBilling();
  const markPaid = useMarkBillingPaid();

  const handleCheckIn = async (childId: string, date: string, billingType: 'PREPAID' | 'POSTPAID') => {
    try {
      await checkIn.mutateAsync({ childId, date, billingType });
      toast.success('Asistencia registrada');
      setIsAddingAttendance(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar asistencia';
      toast.error(errorMessage);
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('¿Eliminar este registro de asistencia?')) return;
    try {
      await deleteAttendance.mutateAsync(attendanceId);
      toast.success('Asistencia eliminada');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(errorMessage);
    }
  };

  const handleGenerateBilling = async (childId: string) => {
    try {
      await generateBilling.mutateAsync({
        childId,
        month: selectedMonth,
        year: selectedYear,
      });
      toast.success('Cobro generado exitosamente');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al generar cobro';
      toast.error(errorMessage);
    }
  };

  const handleMarkPaid = async (billingId: string, method: string) => {
    try {
      await markPaid.mutateAsync({ id: billingId, method });
      toast.success('Pago registrado');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar pago';
      toast.error(errorMessage);
    }
  };

  const getBillingTypeColor = (type: string) => {
    switch (type) {
      case 'PREPAID':
        return 'bg-green-500';
      case 'POSTPAID':
        return 'bg-yellow-500';
      case 'BILLED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getBillingTypeBadge = (type: string) => {
    switch (type) {
      case 'PREPAID':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'POSTPAID':
        return <Badge className="bg-yellow-100 text-yellow-800">Por cobrar</Badge>;
      case 'BILLED':
        return <Badge className="bg-blue-100 text-blue-800">Cobrado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control de Asistencia</h1>
        <p className="text-muted-foreground">
          Registra asistencias y genera cobros mensuales
        </p>
      </div>

      {/* Selector de Mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cartulina
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Registrar
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cobros
          </TabsTrigger>
        </TabsList>

        {/* Tab: Cartulina/Calendario */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Niño</CardTitle>
              <CardDescription>
                Visualiza el calendario de asistencia mensual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingChildren ? (
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              ) : (
                <Select
                  value={selectedChildId || ''}
                  onValueChange={setSelectedChildId}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Selecciona un niño..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {selectedChildId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {calendarData?.child.firstName} {calendarData?.child.lastName} - {MONTHS[selectedMonth - 1]} {selectedYear}
                  </span>
                  {calendarData?.summary && (
                    <div className="flex gap-2 text-sm font-normal">
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pagados: {calendarData.summary.prepaidDays}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Por cobrar: {calendarData.summary.postpaidDays}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Cobrados: {calendarData.summary.billedDays}
                      </Badge>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCalendar ? (
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Header días de la semana */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {DAYS.map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendario */}
                    <div className="grid grid-cols-7 gap-2">
                      {/* Espacios vacíos para el inicio del mes */}
                      {calendarData?.calendar[0] &&
                        Array.from({ length: calendarData.calendar[0].dayOfWeek }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-16" />
                        ))}

                      {/* Días del mes */}
                      {calendarData?.calendar.map((day) => (
                        <div
                          key={day.day}
                          className={`h-16 p-2 rounded-lg border relative ${
                            day.attendance
                              ? 'border-2'
                              : 'border-gray-200 bg-gray-50'
                          } ${
                            day.attendance?.billingType === 'PREPAID'
                              ? 'border-green-400 bg-green-50'
                              : day.attendance?.billingType === 'POSTPAID'
                              ? 'border-yellow-400 bg-yellow-50'
                              : day.attendance?.billingType === 'BILLED'
                              ? 'border-blue-400 bg-blue-50'
                              : ''
                          }`}
                        >
                          <div className="text-sm font-medium">{day.day}</div>
                          {day.attendance && (
                            <>
                              <div
                                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getBillingTypeColor(
                                  day.attendance.billingType
                                )}`}
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {day.attendance.checkInTime &&
                                  new Date(day.attendance.checkInTime).toLocaleTimeString('es-CL', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                              </div>
                              {day.attendance.billingType !== 'BILLED' && (
                                <button
                                  onClick={() => handleDeleteAttendance(day.attendance!.id)}
                                  className="absolute bottom-1 right-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Leyenda */}
                    <div className="flex gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Pagado anticipado</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>Por cobrar</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>Ya cobrado</span>
                      </div>
                    </div>

                    {/* Resumen y acción de cobro */}
                    {calendarData?.summary.postpaidDays > 0 && !calendarData?.summary.monthlyBilling && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {calendarData.summary.postpaidDays} días pendientes de cobro
                            </p>
                            <p className="text-sm text-gray-600">
                              Total estimado: ${(calendarData.summary.postpaidDays * 22000).toLocaleString('es-CL')}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleGenerateBilling(selectedChildId)}
                            disabled={generateBilling.isPending}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Generar Cobro
                          </Button>
                        </div>
                      </div>
                    )}

                    {calendarData?.summary.monthlyBilling && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Cobro mensual: ${Number(calendarData.summary.monthlyBilling.totalAmount).toLocaleString('es-CL')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Estado: {calendarData.summary.monthlyBilling.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                            </p>
                          </div>
                          {calendarData.summary.monthlyBilling.status !== 'COMPLETED' && (
                            <Select onValueChange={(method) => handleMarkPaid(calendarData.summary.monthlyBilling!.id, method)}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Marcar pagado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                                <SelectItem value="CASH">Efectivo</SelectItem>
                                <SelectItem value="TRANSBANK">Transbank</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Registrar Asistencia */}
        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Registrar Asistencia</span>
                <Dialog open={isAddingAttendance} onOpenChange={setIsAddingAttendance}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Asistencia
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Asistencia</DialogTitle>
                      <DialogDescription>
                        Registra la asistencia de un niño para cualquier fecha
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">Fecha</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Niño</label>
                        <Select onValueChange={(childId) => {
                          handleCheckIn(childId, selectedDate, 'POSTPAID');
                        }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecciona un niño..." />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id}>
                                {child.firstName} {child.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Selecciona una fecha y registra la asistencia de los niños
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary text-sm">
                          {child.firstName[0]}{child.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{child.firstName} {child.lastName}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleCheckIn(child.id, selectedDate, 'PREPAID')}
                        disabled={checkIn.isPending}
                      >
                        Pagado
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => handleCheckIn(child.id, selectedDate, 'POSTPAID')}
                        disabled={checkIn.isPending}
                      >
                        Por cobrar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cobros Mensuales */}
        <TabsContent value="billing" className="space-y-4">
          {/* Pendientes de cobro */}
          <Card>
            <CardHeader>
              <CardTitle>Pendientes de Cobro - {MONTHS[selectedMonth - 1]} {selectedYear}</CardTitle>
              <CardDescription>
                Niños con asistencias que aún no han sido facturadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pendingData || pendingData.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No hay asistencias pendientes de cobro
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingData.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-yellow-50"
                    >
                      <div>
                        <p className="font-medium">{child.firstName} {child.lastName}</p>
                        <p className="text-sm text-gray-600">
                          {child.pendingDays} días - ${(child.pendingDays * 22000).toLocaleString('es-CL')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Apoderado: {child.guardian.firstName} {child.guardian.lastName}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleGenerateBilling(child.id)}
                        disabled={generateBilling.isPending}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Generar Cobro
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cobros generados */}
          <Card>
            <CardHeader>
              <CardTitle>Cobros del Mes</CardTitle>
              <CardDescription>
                Cobros mensuales generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!billingsData?.data || billingsData.data.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No hay cobros generados para este mes
                </p>
              ) : (
                <div className="space-y-3">
                  {billingsData.data.map((billing) => (
                    <div
                      key={billing.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        billing.status === 'COMPLETED' ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">
                          {billing.child.firstName} {billing.child.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {billing.totalDays} días - ${Number(billing.totalAmount).toLocaleString('es-CL')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {billing.guardian.firstName} {billing.guardian.lastName} - {billing.guardian.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            billing.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {billing.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                        {billing.status !== 'COMPLETED' && (
                          <Select onValueChange={(method) => handleMarkPaid(billing.id, method)}>
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Pagar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TRANSFER">Transferencia</SelectItem>
                              <SelectItem value="CASH">Efectivo</SelectItem>
                              <SelectItem value="TRANSBANK">Transbank</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
