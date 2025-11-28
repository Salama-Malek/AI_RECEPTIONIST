import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import telephonyConfig from '../config/telephony.config';
import { TelephonyService } from './telephony.service';
import { TelephonyController } from './telephony.controller';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [ConfigModule.forFeature(telephonyConfig), CallsModule],
  controllers: [TelephonyController],
  providers: [TelephonyService],
  exports: [TelephonyService],
})
export class TelephonyModule {}
