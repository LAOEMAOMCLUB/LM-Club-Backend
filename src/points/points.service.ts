
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ReferralRewardTransaction } from 'src/models';
import { Repository, Not } from 'typeorm';
import { UserReferral } from "./../models/userReferral.entity"
import { BeehiveRewardTransaction } from 'src/models/beehiveRewardTransaction.entity'; 
import { UsersService } from 'src/users/users.service'; 
import { RewardPointsMaster } from 'src/models'; 
import { BroadcastRewardTransaction } from 'src/models';

@Injectable()
export class PointsService {
    constructor(
        @InjectRepository(ReferralRewardTransaction)
        private ReferralRewardTransactionRepository: Repository<ReferralRewardTransaction>,

        @InjectRepository(UserReferral)
        private UserReferralRepository: Repository<UserReferral>,

        @InjectRepository(BeehiveRewardTransaction)
        private BeehiveRewardTransactionRepository: Repository<BeehiveRewardTransaction>,

        @InjectRepository(RewardPointsMaster)
        private RewardPointsMasterRepository: Repository<RewardPointsMaster>,
        
        @InjectRepository(BroadcastRewardTransaction)
        private BroadcastRewardTransactionRepository: Repository<BroadcastRewardTransaction>
        
      ) 
      {}

      async myPoints(userId) {
        let referalSum ;
        //let myReferalPoints = await this.ReferralRewardTransactionRepository.find({where: {user: {id: userId},is_active: true},relations: ['userReferral']})

        let myReferalPoints = await this.ReferralRewardTransactionRepository
        .createQueryBuilder('referral_reward_transaction')
        .leftJoinAndSelect('referral_reward_transaction.userReferral', 'userReferral')
        .leftJoinAndSelect('userReferral.user', 'user')
        .leftJoinAndSelect('referral_reward_transaction.user', 'User')
        .select([
          'referral_reward_transaction.id','referral_reward_transaction.transaction_date','referral_reward_transaction.transaction_type','referral_reward_transaction.source',
          'referral_reward_transaction.points','referral_reward_transaction.is_active','userReferral.id','userReferral.referral_code','userReferral.is_active','user.user_name','user.id','User.id','User.user_name'  //'user.image_path'
        ])
        .where({
          user: {id: userId},is_active: true
        })
        .getMany();

        let beehiveSum;
        let mybeehivePoints = await this.BeehiveRewardTransactionRepository
        .createQueryBuilder('beehive_reward_transaction')
        .leftJoinAndSelect('beehive_reward_transaction.beehivePostTracking', 'beehivePostTracking')
        .leftJoinAndSelect('beehivePostTracking.user', 'likedUser')
        .leftJoinAndSelect('beehive_reward_transaction.user', 'user')
        .select([
          'beehive_reward_transaction.id','beehive_reward_transaction.transaction_date','beehive_reward_transaction.transaction_type','beehive_reward_transaction.source',
          'beehive_reward_transaction.points','beehive_reward_transaction.is_active','beehivePostTracking.id','beehivePostTracking.is_created','beehivePostTracking.is_liked','user.id','user.user_name','likedUser.id','likedUser.user_name'  //'user.image_path'
        ]) //
        .where({
          is_active: true,
          user: {id: userId}
        })
        .orderBy('beehive_reward_transaction.created_on', 'DESC')
        .getMany();
        //let mybeehivePoints = await this.BeehiveRewardTransactionRepository.find({where: {user: {id: userId},is_active: true},relations: ['beehivePostTracking','beehivePostTracking.beehivePost','beehivePostTracking.user']}) //,select: ['beehivePostTracking']
        for(let i = 0; i < mybeehivePoints.length; i ++) {
          // sum += Number(myPoints[i].points)

          // if(mybeehivePoints[i].beehivePostTracking.is_created) {
          //   mybeehivePoints[i]['message'] = "Your recieved points for Posting"
          // }
          // else
          if(mybeehivePoints[i].beehivePostTracking.is_liked) {
            mybeehivePoints[i]['message'] = mybeehivePoints[i].beehivePostTracking.user.user_name + " Liked your Post"
          }
        }

        let broadcastSum;
        let myBroadcastPoints = await this.BroadcastRewardTransactionRepository
        .createQueryBuilder('broadcast_reward_transaction')
        .leftJoinAndSelect('broadcast_reward_transaction.broadcastPostTracking', 'broadcastPostTracking')
        .leftJoinAndSelect('broadcastPostTracking.user', 'likedUser')
        .leftJoinAndSelect('broadcast_reward_transaction.user', 'user')
        .select([
          'broadcast_reward_transaction.id','broadcast_reward_transaction.transaction_date','broadcast_reward_transaction.transaction_type','broadcast_reward_transaction.source',
          'broadcast_reward_transaction.points','broadcast_reward_transaction.is_active','broadcastPostTracking.id','broadcastPostTracking.is_created','broadcastPostTracking.is_shared','broadcastPostTracking.mode_of_share','user.id','user.user_name','likedUser.id','likedUser.user_name'  //'user.image_path'
        ]) //
        .where({
          is_active: true,
          user: {id: userId}
        })
        .orderBy('broadcast_reward_transaction.created_on', 'DESC')
        .getMany();

        for(let i = 0; i < myBroadcastPoints.length; i ++) {
          if(myBroadcastPoints[i].broadcastPostTracking.is_shared) {
            myBroadcastPoints[i]['message'] = "You shared the post on " + myBroadcastPoints[i].broadcastPostTracking.mode_of_share.split(" ")[0]
          }
          else {
            myBroadcastPoints[i]['message'] = "Your post was broadcasted."
          }
        }

        referalSum = myReferalPoints.reduce((sum, { points }) => sum + Number(points), 0);
        beehiveSum = mybeehivePoints.reduce((sum, { points }) => sum + Number(points), 0);
        beehiveSum = beehiveSum.toString()

        broadcastSum = myBroadcastPoints.reduce((sum, { points }) => sum + Number(points), 0);
        broadcastSum = broadcastSum.toString()

        return {
          myReferalPoints,
          referalSum,
          mybeehivePoints,
          beehiveSum,
          myBroadcastPoints,
          broadcastSum
        }
      }

      async myReferralCode(userId) {
        let refCode = await this.UserReferralRepository.findOne({where: {user: {id: userId}}})
        let getBonusCount = await this.ReferralRewardTransactionRepository.count({where: {user: {id: Not(userId)},userReferral: {id: refCode.id}}})
        let BonusPoints = await this.pointsMaster("Referral Bonus")
        refCode['bonusPoints'] = Number(BonusPoints.points)
        refCode['referralCount'] = getBonusCount

      //   function getIndexRelativeToTen(number) {
      //     if (number < 10) {
      //         return 0;
      //     } else {
      //         return Math.floor(number / 10);
      //     }
      // }
      // console.log(getIndexRelativeToTen(5)); 

        //console.log("getBonusCount", getBonusCount, Number(BonusPoints.points))
              //  if(getBonusCount % 10 === 0) {
              //     //Referral Bonus
              //  } 
              return refCode
      }

      async pointsMaster(rewardType) {
        return await this.RewardPointsMasterRepository.findOne({where: {reward_type: rewardType,is_active: true}})
      }

}
