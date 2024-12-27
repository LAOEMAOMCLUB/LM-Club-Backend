// twilio.module.ts
import { ConfigService } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [SmsService,ConfigService],
  exports: [SmsService],
})
export class SmsModule {}
