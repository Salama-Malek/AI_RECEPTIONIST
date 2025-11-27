export class TelephonyEventEntity {
  provider!: 'twilio' | 'telnyx';
  payload!: Record<string, any>;
  receivedAt!: Date;

  constructor(partial: Partial<TelephonyEventEntity>) {
    Object.assign(this, partial);
  }
}
