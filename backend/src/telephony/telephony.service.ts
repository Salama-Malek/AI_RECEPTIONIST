import { Injectable, Logger } from '@nestjs/common';
import { CallDirection, CallStatus } from '@prisma/client';
import { CallsService } from '../calls/calls.service';
import { TwilioWebhookDto } from './dto/twilio-webhook.dto';
import { TelnyxWebhookDto } from './dto/telnyx-webhook.dto';

@Injectable()
export class TelephonyService {
  private readonly logger = new Logger(TelephonyService.name);

  constructor(private readonly callsService: CallsService) {}

  async handleTwilioWebhook(dto: TwilioWebhookDto) {
    const direction = dto.Direction?.toUpperCase().includes('INBOUND')
      ? CallDirection.INBOUND
      : CallDirection.OUTBOUND;
    const status = this.mapStatus(dto.CallStatus);

    const record = await this.callsService.logProviderEvent({
      provider: 'twilio',
      fromNumber: dto.From,
      toNumber: dto.To,
      direction,
      status,
      transcript: dto.SpeechResult,
      metadata: {
        callSid: dto.CallSid,
        raw: dto,
      },
    });

    this.logger.log(`Twilio webhook handled for CallSid=${dto.CallSid}`);
    return { ok: true, callId: record.id };
  }

  async handleTelnyxWebhook(dto: TelnyxWebhookDto) {
    const status = this.mapStatus(dto.data?.payload?.status || dto.data?.event_type);
    const payload = dto.data?.payload;
    const direction =
      payload?.direction === 'incoming' ? CallDirection.INBOUND : CallDirection.OUTBOUND;

    const record = await this.callsService.logProviderEvent({
      provider: 'telnyx',
      fromNumber: payload?.from || 'unknown',
      toNumber: payload?.to || 'unknown',
      direction,
      status,
      metadata: dto,
    });

    this.logger.log(`Telnyx webhook handled for call_control_id=${payload?.call_control_id}`);
    return { ok: true, callId: record.id };
  }

  private mapStatus(status?: string): CallStatus {
    const normalized = (status || '').toUpperCase();
    if (normalized.includes('RINGING')) return CallStatus.RINGING;
    if (normalized.includes('IN-PROGRESS') || normalized.includes('IN_PROGRESS'))
      return CallStatus.IN_PROGRESS;
    if (normalized.includes('COMPLETED')) return CallStatus.COMPLETED;
    if (normalized.includes('FAILED') || normalized.includes('BUSY'))
      return CallStatus.FAILED;
    return CallStatus.RECEIVED;
  }
}
