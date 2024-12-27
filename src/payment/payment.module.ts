// your.module.ts
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentsController } from "./payment.controller"
import { UsersModule } from 'src/users/users.module';
import { UserSubscription } from 'src/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from 'src/models';
import { UserSubscriptionService } from "./../users/userSubscription.service"
import { SubscriptionWidgetMap } from 'src/models';
import { CardDetail } from 'src/models';
//import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/email/email.module';
import { FileUploadService } from 'src/middleware/s3.service';
//import { UsersService } from 'src/users/users.service'; 
import { MiddlewareService } from "./../middleware/middleware.service"
import { NotificationService } from "./../notification/notification.service"
import { UserNotification } from 'src/models';
import { BeehivePost } from 'src/models';
import { BroadcastPost } from 'src/models';
import { ContentMaster } from 'src/models';
import { Settings } from 'src/models';

@Module({
  imports: [MailModule,UsersModule,AuthModule,TypeOrmModule.forFeature([Settings,ContentMaster,BroadcastPost,BeehivePost,UserNotification,UserSubscription,UserDetail,SubscriptionWidgetMap,CardDetail])],
  controllers: [PaymentsController],
  providers: [PaymentService,UserSubscriptionService,FileUploadService,MiddlewareService,NotificationService],
  exports: [PaymentService],
})
export class PaymentModule {}
