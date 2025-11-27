import {
  Body,
  Controller,
  ForbiddenException,
  Header,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TelephonyService } from './telephony.service';
import { TwilioWebhookDto } from './dto/twilio-webhook.dto';
import { TelnyxWebhookDto } from './dto/telnyx-webhook.dto';
import { IncomingCallDto } from './dto/incoming-call.dto';
import { StatusCallbackDto } from './dto/status-callback.dto';

@Controller('telephony')
export class TelephonyController {
  constructor(private readonly telephonyService: TelephonyService) {}

  @Post('incoming')
  @Header('Content-Type', 'text/xml')
  handleIncomingCall(@Body() dto: IncomingCallDto, @Req() req: Request) {
    if (!this.telephonyService.validateTwilioSignature(req)) {
      throw new ForbiddenException('Invalid Twilio signature');
    }
    return this.telephonyService.handleIncomingCall(dto);
  }

  @Post('status')
  handleStatusCallback(@Body() dto: StatusCallbackDto, @Req() req: Request) {
    if (!this.telephonyService.validateTwilioSignature(req)) {
      throw new ForbiddenException('Invalid Twilio signature');
    }
    return this.telephonyService.handleStatusCallback(dto);
  }

  @Post('twilio/webhook')
  handleTwilioWebhook(@Body() dto: TwilioWebhookDto) {
    return this.telephonyService.handleTwilioWebhook(dto);
  }

  @Post('telnyx/webhook')
  handleTelnyxWebhook(@Body() dto: TelnyxWebhookDto) {
    return this.telephonyService.handleTelnyxWebhook(dto);
  }
}
