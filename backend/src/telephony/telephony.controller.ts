import { Body, Controller, Post } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { TwilioWebhookDto } from './dto/twilio-webhook.dto';
import { TelnyxWebhookDto } from './dto/telnyx-webhook.dto';

@Controller('telephony')
export class TelephonyController {
  constructor(private readonly telephonyService: TelephonyService) {}

  @Post('twilio/webhook')
  handleTwilioWebhook(@Body() dto: TwilioWebhookDto) {
    return this.telephonyService.handleTwilioWebhook(dto);
  }

  @Post('telnyx/webhook')
  handleTelnyxWebhook(@Body() dto: TelnyxWebhookDto) {
    return this.telephonyService.handleTelnyxWebhook(dto);
  }
}
