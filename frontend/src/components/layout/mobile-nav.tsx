'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  UserCircle,
  CheckCircle,
  BarChart3,
  Settings,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const guardianNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/ninos', label: 'Niños', icon: Users },
  { href: '/reservas', label: 'Reservas', icon: Calendar },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/perfil', label: 'Perfil', icon: UserCircle },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Inicio', icon: Home },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
];

const staffNavItems: NavItem[] = [
  { href: '/staff', label: 'Inicio', icon: Home },
  { href: '/staff/asistencia', label: 'Asistencia', icon: CheckCircle },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems =
    user?.role === 'ADMIN'
      ? adminNavItems
      : user?.role === 'STAFF'
        ? staffNavItems
        : guardianNavItems;

  // Solo mostrar en páginas del dashboard
  const showNav = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/ninos') ||
    pathname.startsWith('/reservas') ||
    pathname.startsWith('/pagos') ||
    pathname.startsWith('/perfil');

  if (!showNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden pb-safe">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-lime-600'
                  : 'text-gray-500 hover:text-lime-600'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                isActive && 'bg-lime-100'
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                'text-[10px] mt-1 font-medium',
                isActive && 'text-lime-700'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
