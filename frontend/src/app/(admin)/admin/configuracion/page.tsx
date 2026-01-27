'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminConfigPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Record<string, unknown>>('/settings', accessToken ?? undefined),
    enabled: !!accessToken,
  });

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      api.put(`/settings/${key}`, { value }, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  useEffect(() => {
    if (settings && typeof settings === 'object') {
      const data: Record<string, string> = {};
      for (const [key, value] of Object.entries(settings)) {
        data[key] = typeof value === 'string' ? value : String(value ?? '');
      }
      setFormData(data);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const promises = Object.entries(formData).map(([key, value]) =>
        updateSetting.mutateAsync({ key, value })
      );
      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setIsSaving(false);
    }
  };

  const settingsConfig = [
    { key: 'business_name', label: 'Nombre del Negocio', type: 'text' },
    { key: 'business_rut', label: 'RUT', type: 'text' },
    { key: 'business_email', label: 'Email de Contacto', type: 'email' },
    { key: 'business_phone', label: 'Teléfono', type: 'tel' },
    { key: 'business_address', label: 'Dirección', type: 'text' },
    { key: 'payment_due_day', label: 'Día Límite de Pago', type: 'number' },
    { key: 'early_payment_discount', label: 'Descuento Pago Anticipado (%)', type: 'number' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Configura los parámetros del sistema
        </p>
      </div>

      {isLoading ? (
        <Card className="animate-pulse">
          <CardContent className="py-12">
            <div className="h-40 bg-gray-100 rounded" />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Datos del Negocio</CardTitle>
              <CardDescription>
                Información que aparece en facturas y comunicaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {settingsConfig.slice(0, 5).map((config) => (
                  <div key={config.key} className="space-y-2">
                    <Label htmlFor={config.key}>{config.label}</Label>
                    <Input
                      id={config.key}
                      type={config.type}
                      value={formData[config.key] || ''}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Pagos</CardTitle>
              <CardDescription>
                Parámetros para facturación y descuentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {settingsConfig.slice(5).map((config) => (
                  <div key={config.key} className="space-y-2">
                    <Label htmlFor={config.key}>{config.label}</Label>
                    <Input
                      id={config.key}
                      type={config.type}
                      value={formData[config.key] || ''}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {message && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
