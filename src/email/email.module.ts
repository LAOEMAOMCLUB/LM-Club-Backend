// mail.module.ts

import { Module } from '@nestjs/common';
import { MailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { EmailTemplate } from 'src/models';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule,TypeOrmModule.forFeature([EmailTemplate])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
