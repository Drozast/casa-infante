'use client';

import { useState } from 'react';
import {
  useAdminChildren,
  useCheckIn,
  useDeleteAttendance,
  useUpdateAttendanceDetails,
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
import { Calendar, CheckCircle, Clock, DollarSign, Plus, Trash2, UserCheck, Car, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie*', 'Sáb'];

interface EditingAttendance {
  id: string;
  hasLunch: boolean;
  hasPickup: boolean;
  pickupTime: string;
}

export default function AdminAttendancePage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [isAddingAttendance, setIsAddingAttendance] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<EditingAttendance | null>(null);

  // Form state for new attendance
  const [newHasLunch, setNewHasLunch] = useState(false);
  const [newHasPickup, setNewHasPickup] = useState(false);
  const [newPickupTime, setNewPickupTime] = useState('');

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
  const updateAttendanceDetails = useUpdateAttendanceDetails();
  const generateBilling = useGenerateMonthlyBilling();
  const markPaid = useMarkBillingPaid();
  const { toast } = useToast();

  const handleCheckIn = async (childId: string, date: string, billingType: 'PREPAID' | 'POSTPAID', hasLunch = false, hasPickup = false, pickupTime = '') => {
    // Verificar que no sea viernes
    const dateObj = new Date(date + 'T12:00:00');
    if (dateObj.getDay() === 5) {
      toast({ title: 'Error', description: 'Casa Infante no abre los viernes', variant: 'destructive' });
      return;
    }

    try {
      await checkIn.mutateAsync({
        childId,
        date,
        billingType,
        hasLunch,
        hasPickup,
        pickupTime: hasPickup ? pickupTime : undefined
      });
      toast({ title: 'Asistencia registrada', variant: 'default' });
      setIsAddingAttendance(false);
      // Reset form
      setNewHasLunch(false);
      setNewHasPickup(false);
      setNewPickupTime('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar asistencia';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleUpdateAttendance = async () => {
    if (!editingAttendance) return;

    try {
      await updateAttendanceDetails.mutateAsync({
        id: editingAttendance.id,
        data: {
          hasLunch: editingAttendance.hasLunch,
          hasPickup: editingAttendance.hasPickup,
          pickupTime: editingAttendance.hasPickup ? editingAttendance.pickupTime : undefined,
        }
      });
      toast({ title: 'Asistencia actualizada', variant: 'default' });
      setEditingAttendance(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('¿Eliminar este registro de asistencia?')) return;
    try {
      await deleteAttendance.mutateAsync(attendanceId);
      toast({ title: 'Asistencia eliminada', variant: 'default' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleGenerateBilling = async (childId: string) => {
    try {
      await generateBilling.mutateAsync({
        childId,
        month: selectedMonth,
        year: selectedYear,
      });
      toast({ title: 'Cobro generado exitosamente', variant: 'default' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al generar cobro';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleMarkPaid = async (billingId: string, method: string) => {
    try {
      await markPaid.mutateAsync({ id: billingId, method });
      toast({ title: 'Pago registrado', variant: 'default' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar pago';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
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
                      {calendarData?.calendar.map((day) => {
                        const isFriday = day.dayOfWeek === 5;
                        const isSunday = day.dayOfWeek === 0;
                        const isWeekend = isFriday || isSunday;

                        return (
                          <div
                            key={day.day}
                            onClick={() => {
                              if (day.attendance && !isWeekend) {
                                setEditingAttendance({
                                  id: day.attendance.id,
                                  hasLunch: day.attendance.hasLunch,
                                  hasPickup: day.attendance.hasPickup,
                                  pickupTime: day.attendance.pickupTime || '',
                                });
                              }
                            }}
                            className={`h-20 p-2 rounded-lg border relative ${
                              isWeekend
                                ? 'bg-gray-100 border-gray-200 opacity-50'
                                : day.attendance
                                ? 'border-2 cursor-pointer hover:shadow-md transition-shadow'
                                : 'border-gray-200 bg-gray-50'
                            } ${
                              !isWeekend && day.attendance?.billingType === 'PREPAID'
                                ? 'border-green-400 bg-green-50'
                                : !isWeekend && day.attendance?.billingType === 'POSTPAID'
                                ? 'border-yellow-400 bg-yellow-50'
                                : !isWeekend && day.attendance?.billingType === 'BILLED'
                                ? 'border-blue-400 bg-blue-50'
                                : ''
                            }`}
                          >
                            <div className="text-sm font-medium flex items-center justify-between">
                              <span>{day.day}</span>
                              {isFriday && <span className="text-[10px] text-gray-400">Cerrado</span>}
                            </div>
                            {day.attendance && !isWeekend && (
                              <>
                                <div
                                  className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getBillingTypeColor(
                                    day.attendance.billingType
                                  )}`}
                                />
                                {/* Iconos de almuerzo y traslado */}
                                <div className="flex gap-1 mt-1">
                                  {day.attendance.hasLunch && (
                                    <span title="Almuerza">
                                      <UtensilsCrossed className="h-3 w-3 text-orange-500" />
                                    </span>
                                  )}
                                  {day.attendance.hasPickup && (
                                    <div className="flex items-center gap-0.5" title={`Traslado ${day.attendance.pickupTime || ''}`}>
                                      <Car className="h-3 w-3 text-purple-500" />
                                      {day.attendance.pickupTime && (
                                        <span className="text-[9px] text-purple-600">{day.attendance.pickupTime}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {day.attendance.billingType !== 'BILLED' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAttendance(day.attendance!.id);
                                    }}
                                    className="absolute bottom-1 right-1 text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Leyenda */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
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
                      <div className="flex items-center gap-1">
                        <UtensilsCrossed className="h-3 w-3 text-orange-500" />
                        <span>Almuerza</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3 text-purple-500" />
                        <span>Traslado</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Haz clic en un día con asistencia para editar almuerzo/traslado. Los viernes están cerrados.
                    </p>

                    {/* Dialog para editar asistencia */}
                    <Dialog open={!!editingAttendance} onOpenChange={(open) => !open && setEditingAttendance(null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Asistencia</DialogTitle>
                          <DialogDescription>
                            Actualiza la información de almuerzo y traslado
                          </DialogDescription>
                        </DialogHeader>
                        {editingAttendance && (
                          <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                                <label className="font-medium">¿Almuerza?</label>
                              </div>
                              <button
                                onClick={() => setEditingAttendance({ ...editingAttendance, hasLunch: !editingAttendance.hasLunch })}
                                className={`w-12 h-6 rounded-full transition-colors ${editingAttendance.hasLunch ? 'bg-orange-500' : 'bg-gray-300'}`}
                              >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${editingAttendance.hasLunch ? 'translate-x-6' : 'translate-x-0.5'}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-purple-500" />
                                <label className="font-medium">¿Traslado?</label>
                              </div>
                              <button
                                onClick={() => setEditingAttendance({ ...editingAttendance, hasPickup: !editingAttendance.hasPickup })}
                                className={`w-12 h-6 rounded-full transition-colors ${editingAttendance.hasPickup ? 'bg-purple-500' : 'bg-gray-300'}`}
                              >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${editingAttendance.hasPickup ? 'translate-x-6' : 'translate-x-0.5'}`} />
                              </button>
                            </div>
                            {editingAttendance.hasPickup && (
                              <div>
                                <label className="text-sm font-medium">Hora del traslado</label>
                                <input
                                  type="time"
                                  value={editingAttendance.pickupTime}
                                  onChange={(e) => setEditingAttendance({ ...editingAttendance, pickupTime: e.target.value })}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                                />
                              </div>
                            )}
                            <Button
                              onClick={handleUpdateAttendance}
                              disabled={updateAttendanceDetails.isPending}
                              className="w-full"
                            >
                              Guardar Cambios
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Resumen y acción de cobro */}
                    {calendarData?.summary?.postpaidDays && calendarData.summary.postpaidDays > 0 && !calendarData?.summary?.monthlyBilling && (
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

                    {calendarData?.summary?.monthlyBilling && (
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

              {/* Verificar si es viernes */}
              {new Date(selectedDate + 'T12:00:00').getDay() === 5 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                  <strong>Viernes cerrado:</strong> Casa Infante no abre los viernes. Selecciona otra fecha.
                </div>
              )}

              {/* Opciones globales de almuerzo y traslado */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newHasLunch"
                    checked={newHasLunch}
                    onChange={(e) => setNewHasLunch(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="newHasLunch" className="flex items-center gap-1 text-sm">
                    <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                    Almuerza
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newHasPickup"
                    checked={newHasPickup}
                    onChange={(e) => setNewHasPickup(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="newHasPickup" className="flex items-center gap-1 text-sm">
                    <Car className="h-4 w-4 text-purple-500" />
                    Traslado
                  </label>
                </div>
                {newHasPickup && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Hora:</label>
                    <input
                      type="time"
                      value={newPickupTime}
                      onChange={(e) => setNewPickupTime(e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => {
                  const isFriday = new Date(selectedDate + 'T12:00:00').getDay() === 5;

                  return (
                    <div
                      key={child.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${isFriday ? 'opacity-50' : 'hover:bg-gray-50'}`}
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
                          onClick={() => handleCheckIn(child.id, selectedDate, 'PREPAID', newHasLunch, newHasPickup, newPickupTime)}
                          disabled={checkIn.isPending || isFriday}
                        >
                          Pagado
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          onClick={() => handleCheckIn(child.id, selectedDate, 'POSTPAID', newHasLunch, newHasPickup, newPickupTime)}
                          disabled={checkIn.isPending || isFriday}
                        >
                          Por cobrar
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
