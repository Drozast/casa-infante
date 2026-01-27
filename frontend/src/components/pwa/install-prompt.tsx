'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(isIOSDevice);

    // Don't show if already installed
    if (isInStandaloneMode) return;

    // For other browsers, listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for manual trigger from download button
    const manualTrigger = () => {
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('show-install-prompt', manualTrigger);

    // Check if dismissed recently - only for auto-show
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const shouldAutoShow = !dismissed ||
      (new Date().getTime() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24) >= 7;

    // For iOS or when we have deferred prompt, auto-show after delay
    if (shouldAutoShow && (isIOSDevice || deferredPrompt)) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('show-install-prompt', manualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-xl border border-lime-200 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-lime-100 flex items-center justify-center flex-shrink-0">
            <Smartphone className="h-6 w-6 text-lime-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">
              Instalar Casa Infante
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {isIOS
                ? 'Toca el boton compartir y selecciona "Agregar a pantalla de inicio"'
                : 'Instala la app para acceso rapido desde tu celular'}
            </p>

            {!isIOS && (
              <Button
                onClick={handleInstall}
                size="sm"
                className="mt-3 bg-lime-600 hover:bg-lime-700 text-xs h-8"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Instalar App
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
