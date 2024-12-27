import { Module } from '@nestjs/common';
import { BeehivePostService } from './beehive.service'; 
import { BeehiveController } from "./beehive.controller"
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusMaster } from "../models/status.entity";
import { Settings } from "../models/settings.entity"
import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from 'src/middleware/middleware.service';
//import { AuthService } from '../auth/auth.service';
import { BeehivePost } from 'src/models/beehivePost.entity'; 
import { BeehivePostMedia } from 'src/models/beehivePostMedia.entity'; 
import { BeehivePostTracking } from 'src/models/beehivePostTracking.entity'; 
import { BeehiveRewardTransaction } from 'src/models/beehiveRewardTransaction.entity'; 
import { BeehiveCategoryMaster } from 'src/models/beehiveCategoryMaster.entity';
import { RewardPointsMaster } from 'src/models';
import { NotificationService } from "./../notification/notification.service"
import { UserNotification } from 'src/models';
import { UserDetail } from "src/models";
import { BroadcastPost } from 'src/models/broadcastPost.entity';
import { BroadcastPostMedia } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';
import { WidgetMaster } from 'src/models';
import { SubscriptionWidgetMap } from 'src/models';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionWidgetMap,WidgetMaster,BroadcastPostMedia,BroadcastPost,UserDetail,UserNotification,RewardPointsMaster,BeehivePost,BeehivePostMedia,StatusMaster,Settings,BeehivePostTracking,BeehiveRewardTransaction,BeehiveCategoryMaster]),],
  controllers: [BeehiveController],
  providers: [NotificationService,BeehivePostService,FileUploadService,MiddlewareService,WidgetService],
  exports: [BeehivePostService]
})
export class BeehiveModule {}