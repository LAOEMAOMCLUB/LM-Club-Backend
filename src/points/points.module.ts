// your.module.ts
import { Module } from '@nestjs/common';
import { PointsController } from './points.controller'; 
import { PointsService } from './points.service'; 
import { ReferralRewardTransaction } from 'src/models'; 
import { TypeOrmModule } from '@nestjs/typeorm';
//import { AuthService } from 'src/auth/auth.service';
//import { AuthModule } from 'src/auth/auth.module';
import { UserReferral } from "./../models/userReferral.entity"
import { BeehiveRewardTransaction } from 'src/models/beehiveRewardTransaction.entity'; 
import { RewardPointsMaster } from 'src/models'; 
import { BroadcastRewardTransaction } from 'src/models';


@Module({
  imports: [TypeOrmModule.forFeature([BroadcastRewardTransaction,RewardPointsMaster,ReferralRewardTransaction,UserReferral,BeehiveRewardTransaction])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
