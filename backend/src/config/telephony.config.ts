import { registerAs } from '@nestjs/config';

export default registerAs('telephony', () => ({
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioVoiceWebhookUrl: process.env.TWILIO_VOICE_WEBHOOK_URL,
  twilioStatusCallbackUrl: process.env.TWILIO_STATUS_CALLBACK_URL,
  gatewayWsUrl: process.env.GATEWAY_WS_URL,
  appPublicBaseUrl: process.env.APP_PUBLIC_BASE_URL,
}));
