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
