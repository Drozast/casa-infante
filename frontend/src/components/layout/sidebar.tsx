'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  Music,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const guardianNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/ninos', label: 'Mis niños', icon: Users },
  { href: '/reservas', label: 'Reservas', icon: Calendar },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/familias', label: 'Familias', icon: Users },
  { href: '/perfil', label: 'Mi perfil', icon: UserCircle },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/ninos', label: 'Niños', icon: Users },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/asistencia', label: 'Asistencia', icon: CheckCircle },
  { href: '/admin/talleres', label: 'Talleres', icon: Music },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

const staffNavItems: NavItem[] = [
  { href: '/staff', label: 'Inicio', icon: Home },
  { href: '/staff/asistencia', label: 'Asistencia', icon: CheckCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems =
    user?.role === 'ADMIN'
      ? adminNavItems
      : user?.role === 'STAFF'
        ? staffNavItems
        : guardianNavItems;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden border border-lime-200 hover:bg-lime-50 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6 text-lime-600" /> : <Menu className="h-6 w-6 text-lime-600" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-white transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-lime-100 px-6 bg-lime-50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-600 text-sm font-bold text-white group-hover:bg-lime-700 transition-colors">
              CI
            </div>
            <span className="text-lg font-semibold text-gray-800">Casa Infante</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-lime-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-lime-50 hover:text-lime-700'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-lime-100 p-4">
          <div className="mb-4 rounded-lg bg-lime-50 p-3">
            <p className="text-sm font-medium text-gray-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start border-lime-200 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-300 transition-colors"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
