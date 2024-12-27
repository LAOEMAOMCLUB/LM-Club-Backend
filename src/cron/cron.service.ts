import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from './../email/email.service';
import { BroadcastPost } from 'src/models';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, Like, MoreThanOrEqual, In } from 'typeorm';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { UserDetail } from 'src/models';
import { BusinessUserDetail } from 'src/models';
import { UserSubscription } from 'src/models';
import { UserNotification } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';


@Injectable()
export class CronService {
  constructor(
    private readonly MailService: MailService,

    @InjectRepository(BroadcastPost)
    private BroadcastPostRepository: Repository<BroadcastPost>,

    private readonly MiddlewareService: MiddlewareService,
    private readonly WidgetService: WidgetService,

    @InjectRepository(UserDetail)
    private UserDetailRepository: Repository<UserDetail>,

    @InjectRepository(BusinessUserDetail)
    private BusinessUserDetailRepository: Repository<BusinessUserDetail>,
    
    @InjectRepository(UserSubscription)
    private UserSubscriptionRepository: Repository<UserSubscription>,

    @InjectRepository(UserNotification)
    private UserNotificationRepository: Repository<UserNotification>
    
    
) {}

  
  private async getBroadcastPosts(): Promise<any[]> {
    let Posts = await this.BroadcastPostRepository.find({where: {
      is_draft: false,is_deleted: false,status: {id: 3},valid_from: await this.MiddlewareService.getCurrentEasternMinute()   //getCurrentMinute()
    },relations: ["user"]})
    return Posts
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    timeZone: 'America/New_York',
  })
  async sendEmailsForValidBroadcasts() {
    //console.log("currentTime----", new Date(),await this.MiddlewareService.getCurrentMinute(),await this.MiddlewareService.getCurrentEasternMinute())
    // console.log("users---", await this.getEmaiIds(310))  
    try {
       const broadcastPosts = await this.getBroadcastPosts();

      for (const post of broadcastPosts) {
        await this.sendEmailsForBroadcast(post);
      }
    } catch (error) {
      console.error('Error sending emails for valid broadcasts:', error);
    }
  }

   async sendEmailsForBroadcast(post: any) {
    // Fetch users who should receive the email
    const users = await this.getEmaiIds(post.user.id);
    //let widId = await this.WidgetService.getWidgetByName("Broadcast")

   let emailData = {
    name : "Lm User",
    businessName: post.user.user_name,
    email: users.emailArray
   }

   await this.MailService.sendMail(emailData,"Broadcast")

   const entitiesToCreate = users.userIds.map(userId => {
    let NotificationData = {
      user: {id: userId},
      actionBy: {id: post.user.id},
      action_type: "Broadcast Post",
      message: post.user.user_name + " just shared a new Ad on broadcast ! Check it out, share it, and earn rewards!",
      widget: {id: 4},
      post_id: post.id
    }
    return NotificationData;
  });

  return this.UserNotificationRepository.save(entitiesToCreate);
  }

  async getEmaiIds(id) {
    let emailArray = []
    let userIds = []
    const users = await this.UserDetailRepository.find({where: {id: Not(id),is_active: true, is_verified_user: true,role: {id: Not(2)}},relations:["role"],select: ["id","email_id"]})
    for(let i = 0; i < users.length; i ++) {
      if(users[i].role.id === 4 && users[i].is_verified_user) {
        emailArray.push(users[i].email_id)
        userIds.push(users[i].id)
      }
      else if(users[i].role.id === 1) {
        let userSubscription = await this.UserSubscriptionRepository.findOne({where: {user: {id: users[i].id},is_active: true}})
        if(userSubscription) {
          emailArray.push(users[i].email_id)
          userIds.push(users[i].id)
        }
        
      }
    }
    return {emailArray,userIds}//users.map(user => user.email_id);
  }


  // async getEmailIds(): Promise<string[]> {
  //   const users = await this.BusinessUserDetailRepository
  //   .createQueryBuilder('UserSubscription')
  //   .leftJoinAndSelect('UserSubscription.user', 'user')
  //   .where('UserSubscription.is_active = :isActive', { isActive: true })
  //   .select('user.email_id')
  //   .getRawMany()
  //   return users.map(user => user.user_email_id);
  // }
}


