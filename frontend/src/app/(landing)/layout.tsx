import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casa Infante | Guarderia y AfterSchool en Isla Teja, Valdivia',
  description: 'Guarderia y AfterSchool en Isla Teja, Valdivia. Grupos pequenos, profesionales en educacion, salidas a la naturaleza y ambiente hogareno.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
