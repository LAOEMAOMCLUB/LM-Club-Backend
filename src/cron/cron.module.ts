import { Module } from '@nestjs/common';
import { MiddlewareService } from './../middleware/middleware.service';
import { CronService } from "./cron.service"
import { BroadcastPost } from 'src/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './../email/email.service';
import { EmailTemplate } from 'src/models';
import { UserDetail } from 'src/models';
import { BusinessUserDetail } from 'src/models';
import { UserSubscription } from 'src/models';
import { UserNotification } from 'src/models';
import { Settings } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';
import { WidgetMaster } from 'src/models';
import { SubscriptionWidgetMap } from 'src/models';
import { FileUploadService } from 'src/middleware/s3.service';

@Module({
    imports: [ScheduleModule.forRoot(),TypeOrmModule.forFeature([SubscriptionWidgetMap,WidgetMaster,Settings,UserNotification,UserSubscription,BusinessUserDetail,UserDetail,EmailTemplate,BroadcastPost])],
  controllers: [],
  providers: [MiddlewareService,CronService,MailService,WidgetService,FileUploadService],
  exports: [CronService]
})
export class CronModule {}