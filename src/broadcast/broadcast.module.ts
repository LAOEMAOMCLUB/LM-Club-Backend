// module.ts

import { Module } from '@nestjs/common';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { BroadcastPostMedia } from 'src/models/broadcastPostMedia.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BroadcastPost } from 'src/models/broadcastPost.entity';
import { BroadcastPostTracking } from 'src/models';
import { BroadcastRewardTransaction } from 'src/models';
import { RewardPointsMaster } from 'src/models';
import { Settings } from 'src/models';
import { NotificationService } from 'src/notification/notification.service';
import { UserNotification } from 'src/models';
import { BeehivePost } from 'src/models';
import { UserDetail } from "src/models"
import { BusinessUserDetail } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';
import { WidgetMaster } from 'src/models';
import { SubscriptionWidgetMap } from 'src/models';


@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionWidgetMap,WidgetMaster,BusinessUserDetail,UserDetail,BeehivePost,UserNotification,Settings,RewardPointsMaster,BroadcastRewardTransaction,BroadcastPostTracking,BroadcastPost,BroadcastPostMedia])],
  controllers: [BroadcastController],
  providers: [NotificationService,BroadcastService,FileUploadService,MiddlewareService,WidgetService],
  exports: [BroadcastService]
})
export class BroadcastModule {}
