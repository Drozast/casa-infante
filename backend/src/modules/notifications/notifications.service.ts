import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('smtp.user'),
        pass: this.configService.get<string>('smtp.password'),
      },
    });
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    sendEmail = true,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    if (sendEmail) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true },
      });

      if (user) {
        await this.sendEmail(user.email, title, message);
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { emailSent: true, emailSentAt: new Date() },
        });
      }
    }

    return notification;
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('smtp.from'),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
    }
  }

  async sendPaymentConfirmation(
    userId: string,
    amount: number,
    childName: string,
    orderId: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Pago Confirmado</h2>
        <p>Tu pago ha sido procesado exitosamente.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Niño:</strong> ${childName}</p>
          <p><strong>Monto:</strong> $${amount.toLocaleString('es-CL')}</p>
          <p><strong>Orden:</strong> ${orderId}</p>
        </div>
        <p>Gracias por confiar en Casa Infante.</p>
      </div>
    `;

    return this.createNotification(
      userId,
      'payment_confirmation',
      'Pago Confirmado',
      html,
      true,
    );
  }

  async sendBookingReminder(
    userId: string,
    childName: string,
    date: string,
    slot: string,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Recordatorio de Reserva</h2>
        <p>Te recordamos que tienes una reserva próxima:</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Niño:</strong> ${childName}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Horario:</strong> ${slot}</p>
        </div>
        <p>¡Te esperamos!</p>
      </div>
    `;

    return this.createNotification(
      userId,
      'booking_reminder',
      'Recordatorio de Reserva',
      html,
      true,
    );
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
