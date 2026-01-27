import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChildrenModule } from './modules/children/children.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    ScheduleModule.forRoot(),

    PrismaModule,

    AuthModule,
    UsersModule,
    ChildrenModule,
    BookingsModule,
    PaymentsModule,
    AttendanceModule,
    WorkshopsModule,
    SettingsModule,
    ReportsModule,
    NotificationsModule,
    InvoicesModule,
    UploadsModule,
    DashboardModule,
  ],
})
export class AppModule {}
