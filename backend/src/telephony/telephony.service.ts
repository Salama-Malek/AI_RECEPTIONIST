import { createHmac, randomUUID } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CallDirection, CallStatus } from '@prisma/client';
import { ConfigType } from '@nestjs/config';
import { CallsService } from '../calls/calls.service';
import { TwilioWebhookDto } from './dto/twilio-webhook.dto';
import { TelnyxWebhookDto } from './dto/telnyx-webhook.dto';
import { IncomingCallDto } from './dto/incoming-call.dto';
import { StatusCallbackDto } from './dto/status-callback.dto';
import telephonyConfig from '../config/telephony.config';
import { Request } from 'express';

@Injectable()
export class TelephonyService {
  private readonly logger = new Logger(TelephonyService.name);
  constructor(
    private readonly callsService: CallsService,
    @Inject(telephonyConfig.KEY)
    private readonly cfg: ConfigType<typeof telephonyConfig>,
  ) {}

  async handleIncomingCall(dto: IncomingCallDto) {
    const gatewayUrl = this.cfg.gatewayWsUrl;
    if (!gatewayUrl) {
      this.logger.warn('GATEWAY_WS_URL not set; TwiML stream URL will be empty');
    }

    const callId = randomUUID();

    await this.callsService.logProviderEvent({
      provider: 'twilio',
      fromNumber: dto.From,
      toNumber: dto.To,
      direction: CallDirection.INBOUND,
      status: CallStatus.RECEIVED,
      metadata: { callSid: dto.CallSid },
    });

    const streamUrl = gatewayUrl || '';
    const twiml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      "  <Say>Connecting you to Salama's AI assistant. Please hold.</Say>",
      '  <Connect>',
      `    <Stream url="${streamUrl}">`,
      `      <Parameter name="callId" value="${callId}"/>`,
      `      <Parameter name="callSid" value="${dto.CallSid}"/>`,
      '    </Stream>',
      '  </Connect>',
      '</Response>',
    ].join('\n');

    return twiml;
  }

  async handleStatusCallback(dto: StatusCallbackDto) {
    const status = this.mapStatus(dto.CallStatus);
    await this.callsService.logProviderEvent({
      provider: 'twilio',
      fromNumber: dto.From || 'unknown',
      toNumber: dto.To || 'unknown',
      direction: CallDirection.INBOUND,
      status,
      metadata: { status: dto.CallStatus, callSid: dto.CallSid, duration: dto.Duration },
    });
    return { ok: true };
  }

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

  validateTwilioSignature(req: Request): boolean {
    try {
      const signature = req.headers['x-twilio-signature'];
      if (!signature || Array.isArray(signature)) {
        return false;
      }
      const url =
        this.cfg.appPublicBaseUrl && this.cfg.appPublicBaseUrl.length > 0
          ? `${this.cfg.appPublicBaseUrl}${req.originalUrl}`
          : `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const params = req.body || {};
      const sortedKeys = Object.keys(params).sort();
      let data = url;
      for (const key of sortedKeys) {
        data += key + params[key];
      }
      const expected = createHmac('sha1', this.cfg.twilioAuthToken || '')
        .update(data)
        .digest('base64');
      const valid = expected === signature;
      if (!valid) {
        this.logger.warn('Twilio signature validation failed');
      }
      return valid;
    } catch (error) {
      this.logger.error({ err: error }, 'Error validating Twilio signature');
      return false;
    }
  }
}
