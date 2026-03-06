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
  CalendarDays,
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
  { href: '/admin/calendario', label: 'Calendario', icon: CalendarDays },
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
          'fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r bg-white transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-20 items-center border-b border-lime-100 px-6 bg-lime-50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-600 text-base font-bold text-white group-hover:bg-lime-700 transition-colors">
              CI
            </div>
            <span className="text-xl font-semibold text-gray-800">Casa Infante</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200',
                      isActive
                        ? 'bg-lime-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-lime-50 hover:text-lime-700'
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-lime-100 p-4">
          <div className="mb-4 rounded-lg bg-lime-50 p-4">
            <p className="text-base font-medium text-gray-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start border-lime-200 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-300 transition-colors text-base py-3"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
