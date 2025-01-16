
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { Post } from 'src/models';
import { In, Repository, Not } from 'typeorm';
// import { PostService } from '../post/post.service';
import { SubscriptionType } from 'src/models';
import { SubscriptionService } from 'src/masters/subscription.service';
import { UserDetail } from 'src/models';
import { WidgetMaster } from 'src/models';
import { UserSubscription } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';
import { Settings } from "../models/settings.entity";
import { BeehivePost } from 'src/models';
import { BeehivePostMedia } from 'src/models'; 
import { BeehivePostService } from 'src/beehive/beehive.service';
import { BroadcastPost } from 'src/models';
import { BroadcastPostTracking } from 'src/models';
import { BroadcastService } from 'src/broadcast/broadcast.service';
import { BusinessUserDetail } from 'src/models';
import { RewardPointsMaster } from 'src/models';
import { BroadcastRewardTransaction } from 'src/models';
import { NotificationService } from 'src/notification/notification.service';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { MailService } from 'src/email/email.service';
import { UserNotification } from 'src/models';
//import { CronService } from 'src/cron/cron.service';

@Injectable()
export class AdminService {
    constructor(
        // @InjectRepository(Post)
        // private PostRepository: Repository<Post>,

        @InjectRepository(UserDetail)
        private UserDetailRepository: Repository<UserDetail>,

        @InjectRepository(WidgetMaster)
        private WidgetMasterRepository: Repository<WidgetMaster>,

        @InjectRepository(UserSubscription)
        private UserSubscriptionRepository: Repository<UserSubscription>,
        
        @InjectRepository(Settings)
        private SettingsRepository: Repository<Settings>,

        // private readonly PostService: PostService,
        private readonly SubscriptionService: SubscriptionService,
        private readonly WidgetService: WidgetService,

        @InjectRepository(BeehivePost)
        private BeehivePostRepository: Repository<BeehivePost>,
        
        @InjectRepository(BeehivePostMedia)
        private BeehivePostMediaRepository: Repository<BeehivePostMedia>,

        private readonly BeehivePostService: BeehivePostService,

        @InjectRepository(BroadcastPost)
        private BroadcastPostRepository: Repository<BroadcastPost>,
        
        @InjectRepository(BroadcastPostTracking)
        private BroadcastPostTrackingRepository: Repository<BroadcastPostTracking>,

        private readonly BroadcastService: BroadcastService,

        @InjectRepository(BusinessUserDetail)
        private BusinessUserDetailRepository: Repository<BusinessUserDetail>,

        @InjectRepository(RewardPointsMaster)
        private RewardPointsMasterRepository: Repository<RewardPointsMaster>,
        
        @InjectRepository(BroadcastRewardTransaction)
        private BroadcastRewardTransactionRepository: Repository<BroadcastRewardTransaction>,

        private readonly NotificationService: NotificationService,
        private readonly MiddlewareService: MiddlewareService,
        private readonly MailService: MailService,

        @InjectRepository(UserNotification)
        private UserNotificationRepository: Repository<UserNotification>
        
        //private readonly CronService: CronService
        
      ) {}


      async sendEmailsForBroadcast(post: any) {
        // Fetch users who should receive the email
        const users = await this.getEmaiIds(post.user.id);
        //let widId = await this.WidgetService.findWidgetById(4)
    
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

    async getAllPosts() {
      const easternTime = await this.MiddlewareService.getEasternTime();
      const posts = await this.BeehivePostRepository.find({
        where: { is_draft: false, is_deleted: false },
        relations: ['status', 'user', 'beehiveCategory'],
        order: { modified_on: 'DESC' }
      });
    
      await Promise.all(posts.map(async post => {
        post["expired"] = ['Coupons/Deals', 'Events'].includes(post.beehiveCategory.category_name) && post.valid_upto < easternTime;
        delete post.user.password;
        post["media"] = await this.BeehivePostService.findAllMedia(Number(post.id));
      }));
    
      return posts;
    }

    async getBroadcastPosts() {
      const posts = await this.BroadcastPostRepository.find({
        where: { is_draft: false, is_deleted: false },
        relations: ['status', 'user'],
        order: { modified_on: 'DESC' }
      });
    
      await Promise.all(posts.map(async post => {
        delete post.user.password;
        post["media"] = await this.BroadcastService.findAllMedia(Number(post.id));
      }));
    
      return posts;
    }
    

    async getExpireDays(flag,startTime) {
      //console.log("data----", flag,startTime)
      let setting = await this.SettingsRepository.findOne({where: {flag: flag}})
      //console.log(setting.post_duration.split("-")[1],setting.post_duration.split("-")[0])
      const startDateTime = startTime;
      if (setting.post_duration.split("-")[1] === "Minutes") {
        startDateTime.setMinutes(startDateTime.getMinutes() + Number(setting.post_duration.split("-")[0]));
      }
      else if (setting.post_duration.split("-")[1] === "Hours") {
        //currentDate.setHours(currentDate.getHours() + 2);
        startDateTime.setHours(startDateTime.getHours() + Number(setting.post_duration.split("-")[0]));
      }
      else if(setting.post_duration.split("-")[1] === "Days") {
        startDateTime.setDate(startDateTime.getDate() + Number(setting.post_duration.split("-")[0]))
      }
      else if(setting.post_duration.split("-")[1] === "Weeks") {
        startDateTime.setDate(startDateTime.getDate() + (7 * Number(setting.post_duration.split("-")[0])))
      }
      else if (setting.post_duration.split("-")[1] === "Months") {
        //console.log("months----")
        startDateTime.setDate(startDateTime.getDate() + ( 30 * Number(setting.post_duration.split("-")[0])))
      }
      // startDateTime.setDate(startDateTime.getDate() + Number(setting.key))
      //console.log(startTime,setting.key,startDateTime)
      return startDateTime
    }

    async getExpireDays1(flag, startTime) {
      console.log("falss---", flag,startTime)
      const setting = await this.SettingsRepository.findOne({ where: { flag } });
      const [duration, unit] = setting.post_duration.split("-");
      const amount = Number(duration);
      console.log("values", duration,unit,amount)
      switch (unit) {
          case "Minutes":
              startTime.setMinutes(startTime.getMinutes() + amount);
              break;
          case "Hours":
              startTime.setHours(startTime.getHours() + amount);
              break;
          case "Days":
              startTime.setDate(startTime.getDate() + amount);
              break;
          case "Weeks":
              startTime.setDate(startTime.getDate() + (7 * amount));
              break;
          case "Months":
              startTime.setDate(startTime.getDate() + (30 * amount));
              break;
      }
  
      return startTime;
  }
  

    async rewardpoints(type) {
      let points = await this.RewardPointsMasterRepository.findOne({where: {reward_type: type}})
      return points.points
    }

    async getAdmin() {
      return await this.UserDetailRepository.findOne({where: {role: {id: 2}}})
    }

    async actionOnPost1(data) {
      const { statusId, postType, postId, userId } = data;
      const actionType = statusId === 3 ? "Approved" : "Rejected";
      let notificationType
      let getPost;
      if (postType === "Broadcast") {
        notificationType = 4
          getPost = await this.BroadcastPostRepository.findOne({ where: { id: postId }, relations: ['user', 'status'] });
      } else {
        notificationType = 3
          getPost = await this.BeehivePostRepository.findOne({ where: { id: postId }, relations: ["user", "beehiveCategory"] });
      }
  
      getPost.status = statusId;
  
      if (statusId === 3) {
          const easternTime = await this.MiddlewareService.getEasternTime();
          const nearestMinute = await this.MiddlewareService.getNearestMinute();
  
          if (postType === "Broadcast") {
              if (getPost.valid_from < easternTime) {
                  getPost.valid_from = nearestMinute;
                  getPost.expires_at = await this.getExpireDays(getPost.post_duration, nearestMinute);
                  getPost.valid_upto = getPost.expires_at;
                  await this.sendEmailsForBroadcast(getPost);
              } else {
                  getPost.expires_at = await this.getExpireDays(getPost.post_duration, getPost.valid_from);
                  getPost.valid_upto = getPost.expires_at;
              }
  
              const trackingData = {
                  user: { id: getPost.user.id },
                  broadcastPost: { id: getPost.id },
                  is_created: true,
                  created_by: getPost.user.id,
                  modified_by: getPost.user.id
              };
  
              const trackingPost = await this.BroadcastPostTrackingRepository.save(trackingData);
  
              const pointsData = {
                  user: { id: getPost.user.id },
                  transaction_date: new Date(),
                  transaction_type: "C",
                  broadcastPostTracking: { id: trackingPost.id },
                  points: Number(await this.rewardpoints(getPost.post_duration))
              };
  
              await this.BroadcastRewardTransactionRepository.save(pointsData);
          } else {
              const { category_name } = getPost.beehiveCategory;
              console.log("category_name",category_name)
              if (["Coupons/Deals", "Events"].includes(category_name)) {
                console.log("if")
                  getPost.valid_from = nearestMinute;
                  getPost.expires_at = getPost.valid_upto;
              } else {
                console.log("else")
                  if (getPost.valid_from < easternTime) {
                    console.log("if less", nearestMinute)
                      getPost.valid_from = nearestMinute;
                      getPost.expires_at = await this.getExpireDays("Beehive Post Expiration", nearestMinute);
                      getPost.valid_upto = getPost.expires_at;
                  } else {
                    console.log("if greater")
                      getPost.expires_at = await this.getExpireDays("Beehive Post Expiration", getPost.valid_from);
                      getPost.valid_upto = getPost.expires_at;
                  }
              }
          }
      }
  
      //const notificationType = postType === "Broadcast" ? await this.WidgetService.getWidgetNameById(4) : await this.WidgetService.getWidgetNameById(3);
      await this.NotificationService.createUserNotification(getPost.user.id, notificationType, userId, actionType, postId, getPost.title || null, postType);
     // let notifyUser = await this.NotificationService.createUserNotification(getPost.user.id,3,data.userId,actionType,data.postId,null,data.postType)
  
      return postType === "Broadcast"
          ? await this.BroadcastPostRepository.save(getPost)
          : await this.BeehivePostRepository.save(getPost);
  }

  async actionOnPost(data) {
    //let nextMinute = await this.MiddlewareService.getNearestMinute()
    //console.log('nextMinute',nextMinute)
   let actionType;
   if(data.statusId === 3) {
    actionType = "Approved"
   }
   else {
    actionType = "Rejected"
   }
    // let expireDays = await this.SettingsRepository.findOne({where: {flag: "Beehive Post Expiration"}})
    // const currentDate = new Date();
    // currentDate.setDate(currentDate.getDate() + Number(expireDays.key))
    let getPost;
    if(data.postType === "Broadcast") {
     getPost = await this.BroadcastPostRepository.findOne({where: {id: data.postId},relations: ['user','status']})
     getPost.status = data.statusId
      if(data.statusId === 3)  {
        //console.log("getPost.valid_from",getPost.valid_from)
        let expireDate
        if(getPost.valid_from < await this.MiddlewareService.getEasternTime()) {  //new Date(
          expireDate = await this.getExpireDays(getPost.post_duration,await this.MiddlewareService.getNearestMinute()) //new Date()
        getPost.expires_at = expireDate
        //getPost.posted_time = new Date()
        getPost.valid_from = await this.MiddlewareService.getCurrentMinute()//new Date()
        getPost.valid_upto = expireDate
        await this.sendEmailsForBroadcast(getPost)
        }
        else { 
          expireDate = await this.getExpireDays(getPost.post_duration,getPost.valid_from)
        getPost.expires_at = expireDate
        //getPost.posted_time = new Date()
        getPost.valid_upto = expireDate
        }
        let trackingData = {
          user: {id: getPost.user.id},
          broadcastPost: {id: getPost.id},
          is_created: true,
          created_by: getPost.user.id,
          modified_by: getPost.user.id
        }
        //console.log("trackingData",trackingData)
        let trackingPost = await this.BroadcastPostTrackingRepository.save(trackingData)

        let pointsData = {
          user: {id: getPost.user.id},
          transaction_date: new Date(),
          transaction_type: "C",
          broadcastPostTracking: {id: trackingPost.id},
          points: Number(await this.rewardpoints(getPost.post_duration))
        }

        let savePointsData = await this.BroadcastRewardTransactionRepository.save(pointsData)

      }
      // else if(data.statusId === 2 && getPost.is_edited) {
      //   getPost.is_edited = false
      // }
     let notifyUser = await this.NotificationService.createUserNotification(getPost.user.id,4,data.userId,actionType,data.postId,getPost.title,data.postType)
     return await this.BroadcastPostRepository.save(getPost)
    }
    else {
      getPost = await this.BeehivePostRepository.findOne({where: {id: data.postId},relations: ["user","beehiveCategory"]})
      getPost.status = data.statusId
      if(data.statusId === 3)  {
        // getPost.expires_at = await this.getExpireDays("Beehive Post Expiration", nextMinute) //new Date()
        // getPost.posted_time = nextMinute//new Date()

        let expireDate
        if(getPost.beehiveCategory.category_name ===  "Coupons/Deals" || getPost.beehiveCategory.category_name ===  "Events") {
           //if(getPost.beehiveCategory.category_name ===  "Coupons/Deals") {
            getPost.valid_from = await this.MiddlewareService.getNearestMinute()
          // }
          getPost.expires_at = getPost.valid_upto
        }
        else {
          if(getPost.valid_from < await this.MiddlewareService.getEasternTime()) {  //new Date(
            expireDate = await this.getExpireDays("Beehive Post Expiration",await this.MiddlewareService.getNearestMinute()) //new Date()
          getPost.expires_at = expireDate
          //getPost.posted_time = new Date()
          //console.log("nest",await this.MiddlewareService.getNearestMinute(), expireDate)
          getPost.valid_from = await this.MiddlewareService.getNearestMinute()
          getPost.valid_upto = expireDate
          }
          else { 
            expireDate = await this.getExpireDays("Beehive Post Expiration",getPost.valid_from)
          getPost.expires_at = expireDate
          //getPost.posted_time = new Date()
          getPost.valid_upto = expireDate
          }
        }
      
      }
      let notifyUser = await this.NotificationService.createUserNotification(getPost.user.id,3,data.userId,actionType,data.postId,null,data.postType)
      return await this.BeehivePostRepository.save(getPost)
    }
   }

    async adminDashboard() {
      const [Plans, Users, Widgets, getBeehivePostsApprovalCount, getBeehivePostsPendingCount, getBroadcastPostsApprovalCount, getBroadcastPostsPendingCount] = await Promise.all([
          this.SubscriptionService.findAllSubscriptions("Admin"),
          this.UserDetailRepository.find({ relations: ['city', 'state', 'role'], order: { modified_on: 'DESC' } }),
          this.WidgetService.findAllWidgets(),
          this.BeehivePostRepository.count({ where: { is_draft: false, status: { id: 3 } } }),
          this.BeehivePostRepository.count({ where: { is_draft: false, status: { id: 1 } } }),
          this.BroadcastPostRepository.count({ where: { is_draft: false, status: { id: 3 } } }),
          this.BroadcastPostRepository.count({ where: { is_draft: false, status: { id: 1 } } })
      ]);
  
      const users = await Promise.all(Users.map(async user => {
          user["verifiedStatus"] = user.is_verified_user ? "verified" : "unverified";
          delete user.password;
  
          if (user.role.id === 1) {
              const subscription = await this.UserSubscriptionRepository.findOne({ where: { user: { id: user.id } }, relations: ['subscription'] });
              if (subscription) user["plan"] = subscription.subscription.plan;
          } else if (user.role.id === 4) {
              const businessDetails = await this.BusinessUserDetailRepository.findOne({ where: { user: { id: user.id } } });
              if (businessDetails) user["businessDetails"] = businessDetails;
          }
  
          return user;
      }));
  
      return {
          Plans,
          totalUsersCount: Users.length,
          totalUsers: users,
          ApprovalCount: getBeehivePostsApprovalCount + getBroadcastPostsApprovalCount,
          PendingApprovalCount: getBeehivePostsPendingCount + getBroadcastPostsPendingCount,
          WidgetsCount: Widgets.length
      };
  }
  
   async updateUserActiveStatus(data) {
     let getUser = await this.UserDetailRepository.findOne({where: {id: data.userId}})
     getUser.is_active = data.activeStatus
     return await this.UserDetailRepository.save(getUser)
   }   

}
