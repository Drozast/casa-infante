import { PrismaClient, UserRole, WorkshopDay } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN USER
  // ═══════════════════════════════════════════════════════════════════
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@casainfante.cl' },
    update: {},
    create: {
      email: 'admin@casainfante.cl',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'Casa Infante',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // ═══════════════════════════════════════════════════════════════════
  // STAFF USER
  // ═══════════════════════════════════════════════════════════════════
  const staffPassword = await bcrypt.hash('staff123', 10);

  const staff = await prisma.user.upsert({
    where: { email: 'staff@casainfante.cl' },
    update: {},
    create: {
      email: 'staff@casainfante.cl',
      password: staffPassword,
      firstName: 'Profesor',
      lastName: 'Demo',
      role: UserRole.STAFF,
      emailVerified: true,
    },
  });

  console.log('✅ Staff user created:', staff.email);

  // ═══════════════════════════════════════════════════════════════════
  // TIME SLOTS
  // ═══════════════════════════════════════════════════════════════════
  const timeSlots = [
    {
      id: 'manana',
      name: 'Mañana',
      startTime: '08:00',
      endTime: '13:00',
      maxCapacity: 15,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
    {
      id: 'tarde',
      name: 'Tarde',
      startTime: '14:00',
      endTime: '18:00',
      maxCapacity: 15,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
    {
      id: 'dia-completo',
      name: 'Día Completo',
      startTime: '08:00',
      endTime: '18:00',
      maxCapacity: 12,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  ];

  for (const slot of timeSlots) {
    await prisma.timeSlot.upsert({
      where: { id: slot.id },
      update: slot,
      create: slot,
    });
  }

  console.log('✅ Time slots created');

  // ═══════════════════════════════════════════════════════════════════
  // PRICING CONFIG
  // ═══════════════════════════════════════════════════════════════════
  const pricingConfigs = [
    { weeklyFrequency: 1, pricePerSession: 22000 },
    { weeklyFrequency: 2, pricePerSession: 20000 },
    { weeklyFrequency: 3, pricePerSession: 18500 },
    { weeklyFrequency: 4, pricePerSession: 18500 },
  ];

  for (const config of pricingConfigs) {
    await prisma.pricingConfig.upsert({
      where: { weeklyFrequency: config.weeklyFrequency },
      update: config,
      create: config,
    });
  }

  console.log('✅ Pricing configs created');

  // ═══════════════════════════════════════════════════════════════════
  // DISCOUNT CONFIG
  // ═══════════════════════════════════════════════════════════════════
  await prisma.discountConfig.upsert({
    where: { id: 'early-payment' },
    update: {},
    create: {
      id: 'early-payment',
      name: 'Pago Anticipado',
      percentage: 5,
      description: 'Descuento por pagar antes del día 5 del mes',
      requiresEarlyPayment: true,
      earlyPaymentDay: 5,
    },
  });

  console.log('✅ Discount configs created');

  // ═══════════════════════════════════════════════════════════════════
  // WORKSHOPS
  // ═══════════════════════════════════════════════════════════════════
  const workshops = [
    {
      name: 'Alemán',
      description: 'Taller de idioma alemán para niños',
      dayOfWeek: WorkshopDay.TUESDAY,
      startTime: '15:00',
      endTime: '16:30',
      maxCapacity: 10,
    },
    {
      name: 'Alemán',
      description: 'Taller de idioma alemán para niños',
      dayOfWeek: WorkshopDay.WEDNESDAY,
      startTime: '15:00',
      endTime: '16:30',
      maxCapacity: 10,
    },
    {
      name: 'Inglés',
      description: 'Taller de idioma inglés para niños',
      dayOfWeek: WorkshopDay.TUESDAY,
      startTime: '15:00',
      endTime: '16:30',
      maxCapacity: 10,
    },
    {
      name: 'Inglés',
      description: 'Taller de idioma inglés para niños',
      dayOfWeek: WorkshopDay.WEDNESDAY,
      startTime: '15:00',
      endTime: '16:30',
      maxCapacity: 10,
    },
    {
      name: 'Música',
      description: 'Taller de música y expresión artística',
      dayOfWeek: WorkshopDay.TUESDAY,
      startTime: '16:30',
      endTime: '18:00',
      maxCapacity: 8,
    },
    {
      name: 'Música',
      description: 'Taller de música y expresión artística',
      dayOfWeek: WorkshopDay.WEDNESDAY,
      startTime: '16:30',
      endTime: '18:00',
      maxCapacity: 8,
    },
  ];

  for (const workshop of workshops) {
    await prisma.workshop.create({
      data: workshop,
    });
  }

  console.log('✅ Workshops created');

  // ═══════════════════════════════════════════════════════════════════
  // CONTENT BLOCKS
  // ═══════════════════════════════════════════════════════════════════
  const contentBlocks = [
    {
      slug: 'welcome_text',
      title: 'Bienvenida',
      content: `Casa Infante nació en agosto de 2021 con el objetivo de brindar un espacio seguro,
educativo y lleno de cariño para los más pequeños. Nuestra plataforma digital está diseñada
para facilitar la inscripción, gestión de asistencia, facturación y personalización de planes
para cada niño y niña que forma parte de nuestra familia.`,
    },
    {
      slug: 'about_workshops',
      title: 'Nuestros Talleres',
      content: `Ofrecemos talleres especializados de Alemán, Inglés y Música,
disponibles los días martes y miércoles en horario de tarde.
Cada taller está diseñado para estimular el desarrollo integral de los niños
a través del aprendizaje lúdico y la expresión artística.`,
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { slug: block.slug },
      update: block,
      create: block,
    });
  }

  console.log('✅ Content blocks created');

  // ═══════════════════════════════════════════════════════════════════
  // SYSTEM SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  const settings = [
    {
      key: 'business_name',
      value: JSON.stringify('Casa Infante'),
      description: 'Nombre del negocio',
    },
    {
      key: 'business_rut',
      value: JSON.stringify(''),
      description: 'RUT del negocio',
    },
    {
      key: 'business_email',
      value: JSON.stringify('contacto@casainfante.cl'),
      description: 'Email de contacto',
    },
    {
      key: 'business_phone',
      value: JSON.stringify(''),
      description: 'Teléfono de contacto',
    },
    {
      key: 'business_address',
      value: JSON.stringify(''),
      description: 'Dirección',
    },
    {
      key: 'payment_due_day',
      value: JSON.stringify(5),
      description: 'Día límite de pago del mes',
    },
    {
      key: 'early_payment_discount',
      value: JSON.stringify(5),
      description: 'Porcentaje de descuento por pago anticipado',
    },
  ];

  for (const setting of settings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }

  console.log('✅ System settings created');

  // ═══════════════════════════════════════════════════════════════════
  // DEMO USERS (GUARDIANS) WITH CHILDREN
  // ═══════════════════════════════════════════════════════════════════
  const demoPassword = await bcrypt.hash('demo123', 10);

  // Demo User 1: María González
  const demoUser1 = await prisma.user.upsert({
    where: { email: 'maria.gonzalez@demo.cl' },
    update: {},
    create: {
      email: 'maria.gonzalez@demo.cl',
      password: demoPassword,
      firstName: 'María',
      lastName: 'González Pérez',
      phone: '+56912345678',
      rut: '12.345.678-9',
      role: UserRole.GUARDIAN,
      emailVerified: true,
    },
  });

  console.log('✅ Demo user 1 created:', demoUser1.email);

  // Children for Demo User 1
  const child1 = await prisma.child.upsert({
    where: { id: 'demo-child-1' },
    update: {},
    create: {
      id: 'demo-child-1',
      firstName: 'Sofía',
      lastName: 'Martínez González',
      birthDate: new Date('2019-03-15'),
      gender: 'F',
      schoolName: 'Colegio DSV Valdivia',
      schoolGrade: '1° Básico',
      allergies: ['Nueces'],
      medicalConditions: [],
      medications: [],
      bloodType: 'A+',
      emergencyContactName: 'Carlos Martínez',
      emergencyContactPhone: '+56987654321',
      emergencyContactRelation: 'Padre',
      guardianId: demoUser1.id,
    },
  });

  const child2 = await prisma.child.upsert({
    where: { id: 'demo-child-2' },
    update: {},
    create: {
      id: 'demo-child-2',
      firstName: 'Mateo',
      lastName: 'Martínez González',
      birthDate: new Date('2021-07-22'),
      gender: 'M',
      schoolName: 'Colegio DSV Valdivia',
      schoolGrade: 'Pre-Kinder',
      allergies: [],
      medicalConditions: [],
      medications: [],
      bloodType: 'O+',
      emergencyContactName: 'Carlos Martínez',
      emergencyContactPhone: '+56987654321',
      emergencyContactRelation: 'Padre',
      guardianId: demoUser1.id,
    },
  });

  console.log('✅ Children for demo user 1 created');

  // Demo User 2: Pedro Soto
  const demoUser2 = await prisma.user.upsert({
    where: { email: 'pedro.soto@demo.cl' },
    update: {},
    create: {
      email: 'pedro.soto@demo.cl',
      password: demoPassword,
      firstName: 'Pedro',
      lastName: 'Soto Muñoz',
      phone: '+56998765432',
      rut: '15.678.901-2',
      role: UserRole.GUARDIAN,
      emailVerified: true,
    },
  });

  console.log('✅ Demo user 2 created:', demoUser2.email);

  // Children for Demo User 2
  const child3 = await prisma.child.upsert({
    where: { id: 'demo-child-3' },
    update: {},
    create: {
      id: 'demo-child-3',
      firstName: 'Valentina',
      lastName: 'Soto Ramírez',
      birthDate: new Date('2018-11-08'),
      gender: 'F',
      schoolName: 'Colegio DSV Valdivia',
      schoolGrade: '2° Básico',
      allergies: ['Lactosa'],
      medicalConditions: [],
      medications: [],
      bloodType: 'B+',
      emergencyContactName: 'Ana Ramírez',
      emergencyContactPhone: '+56911223344',
      emergencyContactRelation: 'Madre',
      guardianId: demoUser2.id,
    },
  });

  console.log('✅ Children for demo user 2 created');

  // ═══════════════════════════════════════════════════════════════════
  // BOOKINGS FOR DEMO USERS
  // ═══════════════════════════════════════════════════════════════════
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Booking for Child 1 (Sofía) - Plan 2 días
  const booking1 = await prisma.booking.upsert({
    where: { id: 'demo-booking-1' },
    update: {},
    create: {
      id: 'demo-booking-1',
      date: nextMonth,
      passType: 'WEEKLY',
      status: 'CONFIRMED',
      weeklyFrequency: 2,
      unitPrice: 20000,
      totalPrice: 160000,
      childId: child1.id,
      slotId: 'tarde',
      confirmedAt: new Date(),
    },
  });

  // Payment for Booking 1
  await prisma.payment.upsert({
    where: { bookingId: booking1.id },
    update: {},
    create: {
      amount: 160000,
      status: 'COMPLETED',
      method: 'TRANSFER',
      finalAmount: 152000,
      discountPercent: 5,
      discountAmount: 8000,
      guardianId: demoUser1.id,
      bookingId: booking1.id,
      paidAt: new Date(),
    },
  });

  // Booking for Child 2 (Mateo) - Plan 3 días
  const booking2 = await prisma.booking.upsert({
    where: { id: 'demo-booking-2' },
    update: {},
    create: {
      id: 'demo-booking-2',
      date: nextMonth,
      passType: 'WEEKLY',
      status: 'CONFIRMED',
      weeklyFrequency: 3,
      unitPrice: 18500,
      totalPrice: 222000,
      childId: child2.id,
      slotId: 'tarde',
      confirmedAt: new Date(),
    },
  });

  // Payment for Booking 2 (pending)
  await prisma.payment.upsert({
    where: { bookingId: booking2.id },
    update: {},
    create: {
      amount: 222000,
      status: 'PENDING',
      method: 'TRANSBANK',
      finalAmount: 222000,
      guardianId: demoUser1.id,
      bookingId: booking2.id,
      dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5),
    },
  });

  // Booking for Child 3 (Valentina) - Plan 2 días
  const booking3 = await prisma.booking.upsert({
    where: { id: 'demo-booking-3' },
    update: {},
    create: {
      id: 'demo-booking-3',
      date: nextMonth,
      passType: 'WEEKLY',
      status: 'CONFIRMED',
      weeklyFrequency: 2,
      unitPrice: 20000,
      totalPrice: 160000,
      childId: child3.id,
      slotId: 'dia-completo',
      confirmedAt: new Date(),
    },
  });

  // Payment for Booking 3 (pending)
  await prisma.payment.upsert({
    where: { bookingId: booking3.id },
    update: {},
    create: {
      amount: 160000,
      status: 'PENDING',
      method: 'TRANSBANK',
      finalAmount: 160000,
      guardianId: demoUser2.id,
      bookingId: booking3.id,
      dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 5),
    },
  });

  console.log('✅ Demo bookings and payments created');

  // ═══════════════════════════════════════════════════════════════════
  // WORKSHOP ENROLLMENTS FOR DEMO CHILDREN
  // ═══════════════════════════════════════════════════════════════════
  const alemanyTuesday = await prisma.workshop.findFirst({
    where: { name: 'Alemán', dayOfWeek: WorkshopDay.TUESDAY },
  });

  const musicaWednesday = await prisma.workshop.findFirst({
    where: { name: 'Música', dayOfWeek: WorkshopDay.WEDNESDAY },
  });

  if (alemanyTuesday) {
    await prisma.workshopEnrollment.upsert({
      where: {
        childId_workshopId: {
          childId: child1.id,
          workshopId: alemanyTuesday.id,
        },
      },
      update: {},
      create: {
        childId: child1.id,
        workshopId: alemanyTuesday.id,
      },
    });
  }

  if (musicaWednesday) {
    await prisma.workshopEnrollment.upsert({
      where: {
        childId_workshopId: {
          childId: child3.id,
          workshopId: musicaWednesday.id,
        },
      },
      update: {},
      create: {
        childId: child3.id,
        workshopId: musicaWednesday.id,
      },
    });
  }

  console.log('✅ Workshop enrollments created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
