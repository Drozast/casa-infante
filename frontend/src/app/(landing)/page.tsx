'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import {
  Users,
  TreePine,
  Home,
  GraduationCap,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Star,
  Menu,
  X,
  Heart,
  Shield,
  MessageCircle,
  LayoutDashboard,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Grupos Reducidos',
    description: 'Permiten un seguimiento cercano y respetuoso del ritmo de cada niño.'
  },
  {
    icon: TreePine,
    title: 'Contacto con la Naturaleza',
    description: 'Actividades al aire libre y salidas a los parques de Isla Teja.'
  },
  {
    icon: Home,
    title: 'Entorno Familiar y Seguro',
    description: 'Un lugar donde los niños se sienten contenidos, protegidos y felices.'
  },
  {
    icon: GraduationCap,
    title: 'Equipo con Experiencia',
    description: 'Formación en educación infantil y trayectoria en el cuidado y desarrollo temprano.'
  }
];

const plans = [
  {
    name: 'Plan 1 Día',
    description: 'Ideal para necesidades puntuales',
    priceDaily: '22.000',
    priceWeekly: '22.000',
    priceMonthly: '83.600',
    features: ['Horario 12:50 - 18:30', 'Actividades educativas', 'Colación incluida opcional']
  },
  {
    name: 'Plan 2 Días',
    description: 'Para asistencia regular',
    priceDaily: '20.000',
    priceWeekly: '40.000',
    priceMonthly: '152.000',
    features: ['Horario flexible', 'Salidas a la naturaleza', 'Descuento por pago adelantado'],
    popular: true
  },
  {
    name: 'Plan 3+ Días',
    description: 'Máxima flexibilidad',
    priceDaily: '18.500',
    priceWeekly: '55.500',
    priceMonthly: '210.900',
    features: ['Mejor precio por día', 'Traslado desde DSV', 'Alimentación opcional']
  }
];

const extras = [
  { name: 'Traslado 12:50 (DSV)', price: '5.000' },
  { name: 'Traslado 13:35', price: '2.000' },
  { name: 'Almuerzo', price: '3.500' },
  { name: 'Colacion', price: '1.500' }
];

// Hook para detectar elementos visibles en el viewport
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Componente para animaciones al hacer scroll
function AnimateOnScroll({
  children,
  animation = 'fadeUp',
  delay = 0,
  className = ''
}: {
  children: React.ReactNode;
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale' | 'fade';
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useInView(0.1);

  const animations = {
    fadeUp: 'translate-y-8 opacity-0',
    fadeLeft: 'translate-x-8 opacity-0',
    fadeRight: '-translate-x-8 opacity-0',
    scale: 'scale-95 opacity-0',
    fade: 'opacity-0'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isInView ? 'translate-y-0 translate-x-0 scale-100 opacity-100' : animations[animation]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determinar la ruta del dashboard según el rol
  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'STAFF':
        return '/staff';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Casa Infante Logo"
                  width={48}
                  height={48}
                  className="rounded-lg transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-lg bg-lime-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className={`font-bold text-xl transition-colors duration-300 ${
                scrolled ? 'text-lime-700' : 'text-lime-700'
              }`}>Casa Infante</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {['servicios', 'precios', 'nosotros', 'contacto'].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="relative text-gray-600 hover:text-lime-600 transition-colors duration-300 group capitalize"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lime-500 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
              {isAuthenticated ? (
                <Link href={getDashboardPath()}>
                  <Button className="bg-lime-600 hover:bg-lime-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Ir al Panel
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="border-lime-600 text-lime-600 hover:bg-lime-50 transition-all duration-300 hover:scale-105">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-lime-600 hover:bg-lime-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      Inscribirse
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-lime-50 transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-16 left-0 right-0 bg-white border-t border-lime-100 shadow-lg transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="flex flex-col gap-2 p-4">
            {['servicios', 'precios', 'nosotros', 'contacto'].map((item, index) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-gray-600 hover:text-lime-600 hover:bg-lime-50 transition-all duration-300 py-3 px-4 rounded-lg capitalize"
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <Link href={getDashboardPath()}>
                  <Button className="w-full bg-lime-600 hover:bg-lime-700">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Ir al Panel
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full border-lime-600 text-lime-600 hover:bg-lime-50">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-lime-600 hover:bg-lime-700">
                      Inscribirse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-lime-50 via-white to-emerald-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lime-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <AnimateOnScroll animation="fadeUp" delay={0}>
                <div className="inline-flex items-center gap-2 bg-lime-100 text-lime-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-lime-200 transition-colors duration-300 cursor-default group">
                  <MapPin className="h-4 w-4 group-hover:animate-bounce" />
                  Isla Teja, Valdivia
                  <Sparkles className="h-3 w-3 text-lime-500" />
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeUp" delay={100}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Un entorno seguro y acogedor para el{' '}
                  <span className="text-lime-600 relative">
                    desarrollo infantil
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C50 2 150 2 198 10" stroke="#84CC16" strokeWidth="4" strokeLinecap="round" className="animate-draw" />
                    </svg>
                  </span>
                </h1>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeUp" delay={200}>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Centro de cuidado infantil y after school enfocado en el bienestar, aprendizaje y desarrollo
                  integral de cada niño. Trabajamos con grupos reducidos y un acompañamiento cercano para
                  garantizar un ambiente seguro, estimulante y familiar.
                </p>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeUp" delay={300}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-lime-600 hover:bg-lime-700 text-lg px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                      Inscribir a mi hijo
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <a href="https://wa.me/56994366597?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Casa%20Infante" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-lime-600 text-lime-600 hover:bg-lime-50 text-lg px-8 transition-all duration-300 hover:scale-105 group">
                      <MessageCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeUp" delay={400}>
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 group cursor-default">
                    <CheckCircle className="h-5 w-5 text-lime-600 transition-transform duration-300 group-hover:scale-125" />
                    <span className="text-gray-600">Profesionales certificados</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-default">
                    <CheckCircle className="h-5 w-5 text-lime-600 transition-transform duration-300 group-hover:scale-125" />
                    <span className="text-gray-600">Traslado DSV</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-default">
                    <CheckCircle className="h-5 w-5 text-lime-600 transition-transform duration-300 group-hover:scale-125" />
                    <span className="text-gray-600">+5 años experiencia</span>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            <AnimateOnScroll animation="scale" delay={200}>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-lime-300 via-lime-200 to-emerald-200 overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-36 h-36 mx-auto mb-6 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform hover:rotate-3 transition-transform duration-300">
                        <Image
                          src="/logo.png"
                          alt="Casa Infante"
                          width={120}
                          height={120}
                          className="rounded-full"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-lime-800">Casa Infante</h3>
                      <p className="text-lime-700 mt-2 font-medium">Guardería - AfterSchool</p>
                      <p className="text-lime-600 text-sm mt-1">Maria Veronica Gajardo</p>

                      {/* Stats */}
                      <div className="flex justify-center gap-8 mt-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Heart className="h-5 w-5 text-red-400 fill-red-400 animate-pulse" />
                            <span className="font-bold text-lime-800">+5</span>
                          </div>
                          <p className="text-xs text-lime-600">Años</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Shield className="h-5 w-5 text-emerald-500" />
                            <span className="font-bold text-lime-800">100%</span>
                          </div>
                          <p className="text-xs text-lime-600">Seguro</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-lime-800">5.0</span>
                          </div>
                          <p className="text-xs text-lime-600">Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="servicios" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fadeUp">
            <div className="text-center mb-16">
              <span className="inline-block bg-lime-100 text-lime-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Nuestros Servicios
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¿Por qué elegir Casa Infante?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                En Casa Infante ofrecemos un lugar pensado para que los niños crezcan con confianza,
                acompañados por profesionales y en un entorno que promueve el aprendizaje, el juego y la tranquilidad.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimateOnScroll key={index} animation="fadeUp" delay={index * 100}>
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-lime-50 group hover:-translate-y-2">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center mb-4 group-hover:bg-lime-500 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-7 w-7 text-lime-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-lime-700 transition-colors duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-16 md:py-24 bg-lime-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll animation="fadeRight">
              <div>
                <span className="inline-block bg-white text-lime-700 px-4 py-1 rounded-full text-sm font-medium mb-4 shadow-sm">
                  Horarios
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Horarios flexibles para tu familia
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Nos adaptamos a las necesidades de las familias de Valdivia con horarios
                  convenientes y opciones de traslado.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Clock, color: 'lime', title: 'AfterSchool Regular', desc: 'Lunes a Jueves: 12:50 - 18:30' },
                    { icon: Clock, color: 'emerald', title: 'Horario Mañana (Vacaciones)', desc: 'Lunes a Viernes: 08:50 - 13:15' },
                    { icon: MapPin, color: 'blue', title: 'Traslado DSV', desc: 'Servicio de traslado desde el colegio' }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-x-1 group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeLeft">
              <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Servicios Adicionales</h3>
                <div className="space-y-4">
                  {extras.map((extra, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-lime-50 -mx-2 px-2 rounded-lg transition-colors duration-300"
                    >
                      <span className="text-gray-700">{extra.name}</span>
                      <span className="font-semibold text-lime-600">${extra.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-6">
                  * Valores en pesos chilenos (CLP) por día
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fadeUp">
            <div className="text-center mb-16">
              <span className="inline-block bg-lime-100 text-lime-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Precios Transparentes
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Planes y Precios
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Opciones flexibles de asistencia y pago según tus necesidades.
                Descuentos por pago mensual adelantado.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <AnimateOnScroll key={index} animation="fadeUp" delay={index * 150}>
                <Card className={`relative transition-all duration-500 hover:-translate-y-3 ${
                  plan.popular
                    ? 'border-2 border-lime-500 shadow-xl scale-105 hover:shadow-2xl'
                    : 'border shadow-lg hover:shadow-xl hover:border-lime-300'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-lime-500 text-white px-4 py-1 rounded-full text-sm font-medium animate-pulse">
                        Más Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">
                        ${plan.priceDaily}
                        <span className="text-base font-normal text-gray-500">/día</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        ${plan.priceMonthly}/mes con pago adelantado
                      </p>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 group">
                          <CheckCircle className="h-5 w-5 text-lime-500 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className="block">
                      <Button className={`w-full transition-all duration-300 hover:scale-105 ${
                        plan.popular
                          ? 'bg-lime-600 hover:bg-lime-700 hover:shadow-lg'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}>
                        Comenzar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-16 md:py-24 bg-gradient-to-br from-lime-50 to-emerald-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll animation="fadeRight" className="order-2 md:order-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-lime-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-8 w-8 text-lime-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Maria Veronica Gajardo</h3>
                    <p className="text-lime-600">Directora y Fundadora</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Soy profesional del área educativa con amplia experiencia en el acompañamiento infantil.
                  Mi vocación es crear un ambiente cálido y seguro donde los niños puedan desarrollarse con
                  confianza, respeto y alegría, sintiéndose acompañados en cada etapa.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-yellow-400 hover:scale-125 transition-transform duration-300"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">Recomendada por familias de Valdivia</span>
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeLeft" className="order-1 md:order-2">
              <span className="inline-block bg-white text-lime-700 px-4 py-1 rounded-full text-sm font-medium mb-4 shadow-sm">
                Sobre Nosotros
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Un lugar donde los niños son lo primero
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Creemos en el valor de la infancia y en la importancia de un cuidado consciente.
                Cada niño es único y merece un entorno que respete su individualidad,
                fomente su autonomía y potencie sus habilidades.
              </p>
              <ul className="space-y-4">
                {[
                  'Comunicación permanente con los padres vía WhatsApp',
                  'Actividades educativas y recreativas diarias',
                  'Exploración de los parques de Isla Teja',
                  'Ambiente seguro y acogedor como en casa'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <CheckCircle className="h-6 w-6 text-lime-500 flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-lime-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <AnimateOnScroll animation="scale">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Dale a tu hijo el cuidado que merece
            </h2>
            <p className="text-xl text-lime-100 mb-8">
              Súmate a las familias que ya eligieron Casa Infante como un lugar de confianza para sus hijos.
              Cupos limitados para mantener grupos pequeños.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-lime-600 hover:bg-lime-50 text-lg px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                  Inscribir ahora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <a href="https://wa.me/56994366597?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Casa%20Infante" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-lime-600 text-lg px-8 transition-all duration-300 hover:scale-105 group">
                  <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Contactar por WhatsApp
                </Button>
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <AnimateOnScroll animation="fadeRight">
              <div>
                <span className="inline-block bg-lime-100 text-lime-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Contacto
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Contáctanos
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  ¿Tienes dudas o quieres más información? Contáctanos y con gusto resolveremos tus consultas.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: Phone, title: 'WhatsApp', value: '+56 9 9436 6597', href: 'tel:+56994366597' },
                    { icon: MapPin, title: 'Ubicación', value: 'Isla Teja, Valdivia' },
                    { icon: Clock, title: 'Horario de Atención', value: 'Lunes a Jueves: 12:50 - 18:30' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-lime-100 flex items-center justify-center group-hover:bg-lime-500 group-hover:scale-110 transition-all duration-300">
                        <item.icon className="h-6 w-6 text-lime-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        {item.href ? (
                          <a href={item.href} className="text-lime-600 hover:underline">{item.value}</a>
                        ) : (
                          <p className="text-gray-600">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeLeft">
              <div className="bg-lime-50 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Enviar mensaje rápido</h3>
                <p className="text-gray-600 mb-6">
                  Haz clic en el botón para iniciar una conversación por WhatsApp
                </p>
                <a
                  href="https://wa.me/56994366597?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Casa%20Infante.%20Me%20gustaria%20recibir%20informaci%C3%B3n%20sobre%3A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                    <MessageCircle className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Abrir WhatsApp
                  </Button>
                </a>
                <div className="mt-6 pt-6 border-t border-lime-200">
                  <p className="text-sm text-gray-500 text-center">
                    Vero te responderá lo antes posible
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4 group">
                <Image
                  src="/logo.png"
                  alt="Casa Infante Logo"
                  width={48}
                  height={48}
                  className="rounded-lg bg-white p-1 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="font-bold text-xl">Casa Infante</span>
              </div>
              <p className="text-gray-400 mb-4">
                Guardería y AfterSchool en Isla Teja, Valdivia.
                Cuidado profesional con amor y dedicación.
              </p>
              <p className="text-gray-500 text-sm">
                 2024 Casa Infante. Todos los derechos reservados.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2">
                {['servicios', 'precios', 'nosotros', 'contacto'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item}`}
                      className="text-gray-400 hover:text-white transition-colors duration-300 capitalize inline-block hover:translate-x-1 transform"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Acceso</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1 transform">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white transition-colors duration-300 inline-block hover:translate-x-1 transform">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes draw {
          from {
            stroke-dasharray: 0 200;
          }
          to {
            stroke-dasharray: 200 0;
          }
        }
        .animate-draw {
          animation: draw 1.5s ease-out forwards;
          stroke-dasharray: 0 200;
        }
      `}</style>
    </div>
  );
}
