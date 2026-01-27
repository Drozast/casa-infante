'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lime-100 flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-lime-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sin conexion
        </h1>

        <p className="text-gray-600 mb-8">
          Parece que no tienes conexion a internet.
          Verifica tu conexion e intenta nuevamente.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            className="w-full bg-lime-600 hover:bg-lime-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>

          <Link href="/">
            <Button variant="outline" className="w-full border-lime-200 hover:bg-lime-50">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Casa Infante - Guarderia y AfterSchool
        </p>
      </div>
    </div>
  );
}
