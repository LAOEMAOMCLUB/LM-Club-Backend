import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
//import { ConfigModule, ConfigService } from '@nestjs/config';
//import entities from './models';
import  dbConfig  from './config/typeorm.config';
//import  dbCon  from './config/typeorm.config';
import { MastersModule } from './masters/masters.module';
import { MiddlewareModule } from "./middleware/middleware.module"
import { MailModule } from './email/email.module';
import { SmsModule } from "./sms/sms.module";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from "./auth/auth.module";
import { PaymentModule } from "./payment/payment.module";
import { PointsModule } from "./points/points.module";
import { BeehiveModule } from "./beehive/beehive.module"
import { AdminModule } from './admin/admin.module'; 
import { BroadcastModule } from "./broadcast/broadcast.module";
import { NotificationModule } from "./notification/notification.module"
import { CronModule } from "./cron/cron.module"
import { ScheduleModule } from '@nestjs/schedule';

//let ENV = '.'+process.env.NODE_ENV+'.env'   //`${process.env.NODE_ENV}.env`//'.env.'+ process.env.NODE_ENV

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   envFilePath: [ENV],//'.env.'+ process.env.NODE_ENV // Add other environment files as needed //'.env.dev','.env.local'
    // }),
  //   ServeStaticModule.forRoot({
  //     rootPath: join(__dirname, '..', 'public'),
  // }),
    //ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(dbConfig),
    UsersModule,
    MastersModule,
    MiddlewareModule,
    MailModule,
    SmsModule,
    AuthModule,
    PaymentModule,
    PointsModule,
    BeehiveModule,
    AdminModule,
    BroadcastModule,
    NotificationModule,
    CronModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
