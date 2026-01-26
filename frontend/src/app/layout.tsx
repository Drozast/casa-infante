import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://casainfante.drozast.xyz'),
  title: {
    default: 'Casa Infante | Guarderia y AfterSchool en Isla Teja, Valdivia',
    template: '%s | Casa Infante'
  },
  description: 'Guarderia y AfterSchool en Isla Teja, Valdivia. Grupos pequenos, profesionales en educacion, salidas a la naturaleza y ambiente hogareno. Atencion de lunes a jueves. Traslado desde DSV disponible.',
  keywords: [
    'guarderia Valdivia',
    'afterschool Valdivia',
    'cuidado infantil Isla Teja',
    'guarderia Isla Teja',
    'afterschool DSV',
    'cuidado ninos Valdivia',
    'guarderia profesional',
    'educacion infantil Valdivia',
    'Casa Infante',
    'Maria Veronica Gajardo'
  ],
  authors: [{ name: 'Casa Infante' }],
  creator: 'Casa Infante',
  publisher: 'Casa Infante',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://casainfante.drozast.xyz',
    siteName: 'Casa Infante',
    title: 'Casa Infante | Guarderia y AfterSchool en Valdivia',
    description: 'Guarderia y AfterSchool en Isla Teja, Valdivia. Grupos pequenos, profesionales en educacion y ambiente hogareno.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Casa Infante - Guarderia y AfterSchool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casa Infante | Guarderia y AfterSchool en Valdivia',
    description: 'Guarderia y AfterSchool en Isla Teja. Grupos pequenos y profesionales en educacion.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Casa Infante',
  },
  formatDetection: {
    telephone: true,
  },
  alternates: {
    canonical: 'https://casainfante.drozast.xyz',
  },
  category: 'education',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#84CC16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ChildCare',
  name: 'Casa Infante',
  description: 'Guarderia y AfterSchool en Isla Teja, Valdivia. Grupos pequenos, profesionales en educacion, salidas a la naturaleza y ambiente hogareno.',
  url: 'https://casainfante.drozast.xyz',
  telephone: '+56994366597',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Valdivia',
    addressRegion: 'Los Rios',
    addressCountry: 'CL',
    streetAddress: 'Isla Teja'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -39.8142,
    longitude: -73.2459
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '12:50',
      closes: '18:30'
    }
  ],
  priceRange: '$18.500 - $22.000 CLP por dia',
  founder: {
    '@type': 'Person',
    name: 'Maria Veronica Gajardo'
  },
  areaServed: {
    '@type': 'City',
    name: 'Valdivia'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
