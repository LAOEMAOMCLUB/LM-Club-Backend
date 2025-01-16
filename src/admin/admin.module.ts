import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
//import { Post } from '.././models/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
// import { PostService } from "../post/post.service"
// import { PostMedia } from 'src/models';
// import { StatusMaster } from 'src/models';
import { Settings } from 'src/models';
import { UserDetail } from 'src/models';
import { SubscriptionType } from 'src/models';
import { SubscriptionService } from 'src/masters/subscription.service';
import { SubscriptionWidgetMap } from 'src/models';
import { WidgetMaster } from 'src/models';
import { UserSubscription } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FileUploadService } from 'src/middleware/s3.service';
import { UsersModule } from 'src/users/users.module';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { UserReferral } from 'src/models'; 
import { ReferralRewardTransaction } from "src/models"
import { RewardPointsMaster } from "src/models"
import { BusinessUserDetail } from "src/models"
import { BeehivePost } from 'src/models';
import { BeehivePostMedia } from 'src/models';
import { BeehivePostService } from 'src/beehive/beehive.service';
import { BeehivePostTracking } from "src/models";
import { BeehiveRewardTransaction } from "src/models";
import { BeehiveCategoryMaster } from "src/models";
import { BroadcastPost } from 'src/models';
import { BroadcastPostTracking } from "src/models";
import { BroadcastService } from 'src/broadcast/broadcast.service';
import { BroadcastPostMedia } from 'src/models/broadcastPostMedia.entity';
import { BroadcastRewardTransaction } from 'src/models';
import { NotificationService } from "./../notification/notification.service"
import { UserNotification } from 'src/models';
//import { CronService } from 'src/cron/cron.service';
import { MailService } from 'src/email/email.service';
import { EmailTemplate } from 'src/models';
import { contentMasterService } from './../masters/contentMaster.service';
import { ContentMaster } from 'src/models';


@Module({
  imports: [TypeOrmModule.forFeature([ContentMaster,EmailTemplate,UserNotification,BroadcastRewardTransaction,BroadcastPostMedia,BroadcastPost,BroadcastPostTracking,BeehiveCategoryMaster,BeehiveRewardTransaction,BeehivePostTracking,BeehivePostMedia,BeehivePost,BusinessUserDetail,RewardPointsMaster,ReferralRewardTransaction,UserReferral,Settings,UserDetail,SubscriptionType,SubscriptionWidgetMap,WidgetMaster,UserSubscription]),UsersModule],
  controllers: [AdminController],
  providers: [contentMasterService,MailService,BeehivePostService,AdminService,SubscriptionService,WidgetService,AuthService,JwtService,UsersService,FileUploadService,MiddlewareService,BroadcastService,NotificationService],
  exports: [AdminService],
})
export class AdminModule {}