import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from './../models/user.entity';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSubscriptionService } from './userSubscription.service';
import { UserSubscription } from './../models/userSubscription.entity';
//import { UserWidgetService } from "./userWidget.service";
//import { UserWidget } from './../models/userwidget.entity';
import { WidgetService } from "./../masters/widget.service";
import { WidgetMaster } from "./../models/widget.entity";
import { SubscriptionWidgetMap } from '../models/subscriptionWidgetMap.entity';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { UserVerificationService } from "./userVerification.service";
import { UserVerification } from 'src/models';
import { City } from 'src/models';
import { State } from 'src/models';
//import { TwilioModule } from 'nestjs-twilio';
import { MailService } from 'src/email/email.service';
//import { ConfigService } from '@nestjs/config';
//import { SmsService } from "../sms/sms.service";
import { FileUploadService } from "src/middleware/s3.service"
import { EmailTemplate } from 'src/models';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserReferral } from 'src/models'; 
import { ReferralRewardTransaction } from "src/models";
import { RewardPointsMaster } from 'src/models'; 
import { BusinessUserDetail } from 'src/models';
import { BusinessUserDetailService } from "./userBusiness.service";
import { UserCardService } from "./userCards.service"
import { CardDetail } from 'src/models';
import { ContentMaster } from 'src/models';
import { contentMasterService } from './../masters/contentMaster.service';
import { Settings } from 'src/models';
import { NotificationService } from "./../notification/notification.service"
import { UserNotification } from 'src/models';
import { BeehivePost } from 'src/models';
import { BroadcastPost } from 'src/models';
import { PaymentService } from "./../payment/payment.service"
@Module({
  imports: [TypeOrmModule.forFeature([BroadcastPost,BeehivePost,UserNotification,Settings,ContentMaster,CardDetail,BusinessUserDetail,UserDetail,UserSubscription,WidgetMaster,SubscriptionWidgetMap,UserVerification,City,State,EmailTemplate,UserReferral,ReferralRewardTransaction,RewardPointsMaster]),
  // TwilioModule.forRoot({
  //   accountSid: "ACe26263bd307096a0257d1aabc283e48e",
  //   authToken: "02f974582de5e05dec2d524976931b10"
  // })
],
  controllers: [UsersController],
  providers: [PaymentService,NotificationService,contentMasterService,UserCardService,UsersService,UserSubscriptionService,WidgetService,MiddlewareService,UserVerificationService,MailService,FileUploadService,AuthService,JwtService,BusinessUserDetailService], //SmsService
  exports: [UsersService,UserSubscriptionService,WidgetService],
})

export class UsersModule {}
