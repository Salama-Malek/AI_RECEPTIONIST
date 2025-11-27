import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaService } from '../database/prisma.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private telegramBot: TelegramBot | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.telegramBot = new TelegramBot(token, { polling: false });
    }
  }

  async send(dto: SendNotificationDto) {
    const record = await this.prisma.notification.create({
      data: {
        channel: dto.channel,
        destination: dto.destination || '',
        subject: dto.subject,
        message: dto.message,
        status: NotificationStatus.PENDING,
      },
    });

    try {
      if (dto.channel === NotificationChannel.EMAIL) {
        await this.sendEmail(dto);
      } else {
        await this.sendTelegram(dto);
      }
      await this.prisma.notification.update({
        where: { id: record.id },
        data: { status: NotificationStatus.SENT },
      });
      return { id: record.id, status: NotificationStatus.SENT };
    } catch (error) {
      await this.prisma.notification.update({
        where: { id: record.id },
        data: {
          status: NotificationStatus.FAILED,
          error: (error as Error).message,
        },
      });
      throw error;
    }
  }

  private async sendEmail(dto: SendNotificationDto) {
    const host = this.configService.get<string>('EMAIL_SMTP_HOST');
    const port = this.configService.get<number>('EMAIL_SMTP_PORT');
    const user = this.configService.get<string>('EMAIL_SMTP_USER');
    const pass = this.configService.get<string>('EMAIL_SMTP_PASSWORD');
    const from = this.configService.get<string>('EMAIL_FROM') || 'AI Receptionist <noreply@example.com>';
    const to = dto.destination || user;

    if (!host || !port || !user || !pass || !to) {
      this.logger.warn('Email transport not configured, skipping email send');
      return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: false,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject: dto.subject || 'AI Receptionist Notification',
      text: dto.message,
    });
    this.logger.log(`Email notification sent to ${to}`);
  }

  private async sendTelegram(dto: SendNotificationDto) {
    const chatId =
      dto.destination || this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!this.telegramBot || !chatId) {
      this.logger.warn('Telegram bot not configured, skipping telegram send');
      return { skipped: true };
    }

    await this.telegramBot.sendMessage(chatId, dto.message, {
      disable_web_page_preview: true,
    });
    this.logger.log(`Telegram notification sent to chat ${chatId}`);
  }
}
