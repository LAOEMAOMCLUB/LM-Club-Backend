
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserNotification } from 'src/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeehivePost } from 'src/models';
import { UserDetail } from "src/models"
import { NotificationController } from "./notification.controller"
import { BroadcastPost } from 'src/models/broadcastPost.entity';
import { FileUploadService } from 'src/middleware/s3.service';
import { WidgetService } from 'src/masters/widget.service';
import { WidgetMaster } from 'src/models';
import { SubscriptionWidgetMap } from 'src/models';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { Settings } from 'src/models';

@Module({
  imports: [TypeOrmModule.forFeature([Settings,SubscriptionWidgetMap,WidgetMaster,BroadcastPost,UserDetail,BeehivePost,UserNotification])],
  controllers: [NotificationController],
  providers: [NotificationService,FileUploadService,WidgetService,MiddlewareService],
  exports: [NotificationService],
})
export class NotificationModule {}