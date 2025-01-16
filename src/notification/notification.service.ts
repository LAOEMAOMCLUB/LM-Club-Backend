import { Injectable } from '@nestjs/common';
import { UserNotification } from 'src/models';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BeehivePost } from 'src/models';
import { UserDetail } from "src/models";
import { BroadcastPost } from 'src/models';
import { FileUploadService } from 'src/middleware/s3.service';
import { WidgetService } from 'src/masters/widget.service';

@Injectable()
export class NotificationService {

    constructor(
        @InjectRepository(UserNotification)
        private UserNotificationRepository: Repository<UserNotification>,

        @InjectRepository(BeehivePost)
        private BeehivePostRepository: Repository<BeehivePost>,

        @InjectRepository(UserDetail)
        private UserDetailRepository: Repository<UserDetail>,

        @InjectRepository(BroadcastPost)
        private BroadcastPostRepository: Repository<BroadcastPost>,
        
        private readonly FileUploadService: FileUploadService,
        private readonly WidgetService: WidgetService
        
      ) {}

    async createNotification(action_by,post_id,type) {
        // let findNotification = await this.UserNotificationRepository.findOne({where: {post_id: post_id,actionBy: {id: action_by},action_type: type}})
        // //console.log("data------",findNotification)
        // if(!findNotification) {
            let findPostUser = await this.BeehivePostRepository.findOne({where: {id: post_id},relations: ['user']})
            //let findUser = await this.UserDetailRepository.findOne({where: {id: action_by}})
            let saveData  = {
                user: {id: action_by},
                actionBy: {id: action_by},
                widget: {id: 3}, //await this.WidgetService.getWidgetByName("Beehive")
                post_id: post_id,
                message: "Your post about " + findPostUser.title + " received a new like!",
                action_type: type
            }
            
            let saveNotification = await this.UserNotificationRepository.save(saveData)
            return saveNotification
        // }
        // else {
        //     return null
        // }
        
    }

    async getAdmin() {
        let getAdmin = await this.UserDetailRepository.findOne({where: {role: {id: 2}}})
        return getAdmin.id
      }

      async getPostUser(action_by) {
        let getUser = await this.UserDetailRepository.findOne({where: {id: action_by}})
       return getUser.user_name
      }

    async createAdminNotification(widget_id,type,post_id,action_by) {
      let createData = {
        user: {id: await this.getAdmin()},
        widget: {id: widget_id},
        actionBy: {id: action_by},
        action_type: type,
        message: await this.getPostUser(action_by) + " has uploaded a " + type + " post.",
        post_id: post_id
      }
      return await this.UserNotificationRepository.save(createData)
    }

    async createUserNotification(userId,widgetId,actionBy,type,postId,postTitle,postType) {
      let message 
      if(type === "Approved") {
        message = "Your " + postType + " post has been approved and is now live!"
      }
      else {
        if (widgetId === 3) {
          message = "Your post " + postTitle + " has not met our community guidelines. Please review our guidelines and post again"
        }
        else {
          message = "Your advertisement " + postTitle + " did not meet our advertising guidelines. Please review and resubmit."
        }
        
      }
      let createData = {
        user: {id: userId},
        widget: {id: widgetId},
        actionBy: {id: actionBy},
        action_type: type,
        message: message,
        post_id: postId
      }
      return await this.UserNotificationRepository.save(createData)
    }

    async createReferralNotification(userId,type,points) {
      let message = ''
      if(type === "Referral Used") {
        message = "Your friend just enrolled using your referral code! You've earned " + points +  " reward points."
      }
      else if (type === "10th referral") {
        message = "Congratulations! You've enrolled 10 members and earned a trophy and " + points + " for your outstanding community building efforts."
      }
      else {
        message = "Congratulations! You've earned " + points + " reward points for signing up with your friend's referral code!"
      }
      let createData = {
        user: {id: userId},
        widget: {id: 12}, //await this.WidgetService.getWidgetByName("Refer & Earn")
        actionBy: {id: userId},
        action_type: type,
        message: message
      }
      return await this.UserNotificationRepository.save(createData)
    }

    async createShareRewardNotification(userId,postName,shareType,points,postId) {
      let createData = {
        user: {id: userId},
        widget: {id: 4}, //await this.WidgetService.getWidgetByName("Broadcast")
        actionBy: {id: userId},
        action_type: "Share",
        post_id: postId,
        message: "Your share of " + postName + " on " +  shareType + " earned you " + points + " reward points!"
      }
      return await this.UserNotificationRepository.save(createData)
    }

    async createBroadcastPostRewardNotification(userId,points,rewardsFor,postName,postId) {
      let createData = {
        user: {id: userId},
        widget: {id: await this.WidgetService.getWidgetByName("Broadcast")},
        actionBy: {id: userId},
        action_type: await this.WidgetService.getWidgetNameById(4),
        post_id: postId,
        message: "You've earned " + points + " reward points for " +  rewardsFor +  " for posting the " + postName + " advertisement."
      }
      return await this.UserNotificationRepository.save(createData)
    }

    async createBeehiveLikeRewardNotification(userId,postId,points) {
      let createData = {
        user: {id: userId},
        widget: {id: 3}, // await this.WidgetService.getWidgetByName("Beehive")
        actionBy: {id: userId},
        action_type: await this.WidgetService.getWidgetNameById(3),
        post_id: postId,
        message: "Your post has received a new like and earned you " + points + " rewards points"
      }
      return await this.UserNotificationRepository.save(createData)
    }

    async getNotifications(userId) {
        let unreadCount = await this.UserNotificationRepository.count({where: {user: {id: userId},is_read: false,is_active: true}})
        let allNotifications = await this.UserNotificationRepository.find({where: {user: {id: userId},is_active: true},relations: ['actionBy','widget'],
        order: {
          created_on: 'DESC', 
        }})
        for (let i = 0; i < allNotifications.length; i ++) {
          if(allNotifications[i].actionBy.image_path != null) {
            allNotifications[i].actionBy.image_path = await this.FileUploadService.generateCloudFrontUrl(allNotifications[i].actionBy.image_path)
          }
          else {
            allNotifications[i].actionBy.image_path = "https://uatlmclub.s3.amazonaws.com/uploads/sampleprofile/1712823472-userProfile.png"
          }
            
        delete allNotifications[i].actionBy.password
        }
      return {
        unreadCount,
        allNotifications
      }
    }

    async readAllNotifications(userId) {
        let readNotifications = await this.UserNotificationRepository
        .createQueryBuilder()
        .update("user_notification")
        .set({ is_read: true })
        .where('user = :userId', { userId })
        .andWhere('is_read = false')
        .execute();
        return readNotifications
    }

    async markAllAsReadNotifications(userId) {
      let maskAsReadNotifications = await this.UserNotificationRepository
      .createQueryBuilder()
      .update("user_notification")
      .set({ is_viewed: true })
      .where('user = :userId', { userId })
      .andWhere('is_viewed = false')
      .execute();
      return maskAsReadNotifications
  }

    async deleteNotification(id) {
      let findNotification = await this.UserNotificationRepository.findOne({where: {id: id}})
      findNotification.is_active = false 
      return await this.UserNotificationRepository.save(findNotification)
    }

    async viewNotification(id) {
        let findNotification = await this.UserNotificationRepository.findOne({where: {id: id},relations: ['actionBy']})
        findNotification.is_viewed = true
        findNotification.is_read = true
        if(findNotification.actionBy.image_path != null) {
          findNotification.actionBy.image_path = await this.FileUploadService.generateCloudFrontUrl(findNotification.actionBy.image_path)
        }
        else {
          findNotification.actionBy.image_path = "https://uatlmclub.s3.amazonaws.com/uploads/sampleprofile/1712823472-userProfile.png"
        }
        
        delete findNotification.actionBy.password
        return await this.UserNotificationRepository.save(findNotification)
    }

    async getUserNotifications(userId) {
      let getTotalUnreadCount = await this.UserNotificationRepository.count({where: {user: {id: userId},is_read: false,is_active: true}})
      let getBeehiveUnreadCount = await this.UserNotificationRepository.count({where: {user: {id: userId},widget: {id: 3},is_read: false,is_active: true}})
      let getBroadcastUnreadCount = await this.UserNotificationRepository.count({where: {user: {id: userId},widget: {id: 4},is_read: false,is_active: true}})
      let getReferAndEarnUnreadCount = await this.UserNotificationRepository.count({where: {user: {id: userId},widget: {id: 12},is_read: false,is_active: true}})

      let getAllNotificationList = await this.UserNotificationRepository.find({where: {user: {id: userId},is_active: true},relations: ['actionBy','widget'],
      order: {
        created_on: 'DESC', 
      }})
      for (let i = 0; i < getAllNotificationList.length; i ++) {
        if(getAllNotificationList[i].actionBy.image_path != null) {
          getAllNotificationList[i].actionBy.image_path = await this.FileUploadService.generateCloudFrontUrl(getAllNotificationList[i].actionBy.image_path)
        }
        else {
          getAllNotificationList[i].actionBy.image_path = "https://uatlmclub.s3.amazonaws.com/uploads/sampleprofile/1712823472-userProfile.png"
        }
          
      delete getAllNotificationList[i].actionBy.password
      }

      return {
        getTotalUnreadCount,
        getBeehiveUnreadCount,
        getBroadcastUnreadCount,
        getReferAndEarnUnreadCount,
        getAllNotificationList
      }
    }

    async readOrDeleteNotifications(data) {
      let readNotifications 
      let userId = data.userId
      let widgetId = data.widgetId
      if(data.actionType === "read") {
        if(data.ids.length > 0) {
          readNotifications = await this.UserNotificationRepository
          .createQueryBuilder()
          .update("user_notification")
          .set({ is_read: true })
          .whereInIds(data.ids)
          .execute();
          return readNotifications
        }
        else {
         readNotifications = await this.UserNotificationRepository
          .createQueryBuilder()
          .update("user_notification")
          .set({ is_read: true })
          .where('user = :userId', { userId })
          .andWhere('is_read = false')
          .andWhere('widget = :widgetId', { widgetId })
          .execute();
          return readNotifications
        }
      }
      else {
        if(data.ids.length > 0) {
         readNotifications = await this.UserNotificationRepository
          .createQueryBuilder()
          .update("user_notification")
          .set({ is_active: false })
          .whereInIds(data.ids)
          .execute();
          return readNotifications
        }
        else {
         readNotifications = await this.UserNotificationRepository
          .createQueryBuilder()
          .update("user_notification")
          .set({ is_active: false })
          .where('user = :userId', { userId })
          .andWhere('widget = :widgetId', { widgetId })
          .andWhere('is_active = true')
          .execute();
          return readNotifications
        }
      }
    }
 
    }

    
