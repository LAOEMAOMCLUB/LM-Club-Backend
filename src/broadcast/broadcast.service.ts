import { Injectable } from '@nestjs/common';
import { BroadcastPost } from 'src/models/broadcastPost.entity';
import { Not, Repository, Like, MoreThanOrEqual, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { BroadcastPostMedia } from 'src/models/broadcastPostMedia.entity';
import { BroadcastPostTracking } from 'src/models';
import { BroadcastRewardTransaction } from 'src/models';
import { RewardPointsMaster } from 'src/models';
import { Settings } from 'src/models';
import { NotificationService } from 'src/notification/notification.service';
import { UserDetail } from 'src/models';
import { BusinessUserDetail } from 'src/models';
import { WidgetService } from 'src/masters/widget.service';

@Injectable()
export class BroadcastService {

    constructor(
        @InjectRepository(BroadcastPost)
        private BroadcastPostRepository: Repository<BroadcastPost>,

        private readonly FileUploadService: FileUploadService,
        private readonly MiddlewareService: MiddlewareService,

        @InjectRepository(BroadcastPostMedia)
        private BroadcastPostMediaRepository: Repository<BroadcastPostMedia>,

        @InjectRepository(BroadcastPostTracking)
        private BroadcastPostTrackingRepository: Repository<BroadcastPostTracking>,

        @InjectRepository(BroadcastRewardTransaction)
        private BroadcastRewardTransactionRepository: Repository<BroadcastRewardTransaction>,

        @InjectRepository(RewardPointsMaster)
        private RewardPointsMasterRepository: Repository<RewardPointsMaster>,
        
        @InjectRepository(Settings)
        private SettingsRepository: Repository<Settings>,

        private readonly NotificationService: NotificationService,
        private readonly WidgetService: WidgetService,

        @InjectRepository(UserDetail)
        private UserDetailRepository: Repository<UserDetail>,

        @InjectRepository(BusinessUserDetail)
        private BusinessUserDetailRepository: Repository<BusinessUserDetail>
        
        
    ) {}

      // Function to get start and end time of today
// async getToday() {
//     const now = await this.MiddlewareService.getEasternTime()//new Date();
//     const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // Set hours, minutes, and seconds to 0
//     const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); // Set hours, minutes, and seconds to end of the day
//     return { start, end };
//   }
  
//   // Function to get start and end time of current week
//   async getCurrentWeek() {
//     const now = await this.MiddlewareService.getEasternTime()//new Date();
//     const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0); // Set to the start of the week (Sunday)
//     const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()), 23, 59, 59); // Set to the end of the week (Saturday)
//     return { start, end };
//   }
  
//   // Function to get start and end time of current month
//   async getCurrentMonth() {
//     const now = await this.MiddlewareService.getEasternTime()//new Date();
//     const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0); // Set to the start of the month
//     const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Set to the end of the month
//     return { start, end };
//   }

//   async getLastMonth() {
//     const now = await this.MiddlewareService.getEasternTime(); // Assume this returns a Date object
//     const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
//     const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
//     // Calculate the start and end of the last month
//     const startOfLastMonth = new Date(startOfCurrentMonth);
//     startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  
//     const endOfLastMonth = new Date(startOfLastMonth.getFullYear(), startOfLastMonth.getMonth() + 1, 0, 23, 59, 59);
  
//     return { start: startOfLastMonth, end: endOfLastMonth };
//   }

  async getAdmin() {
    return await this.UserDetailRepository.findOne({where: {role: {id: 2}}})
  }

  // async getNextMinute() {
  //   const currentTime = new Date();
  //   const nextMinute = new Date(currentTime);
  //   nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  //   nextMinute.setSeconds(0);
  //   nextMinute.setMilliseconds(0);
  //   return nextMinute;
  // }
  
    async uploadPost(data) {

      // const currentTime = new Date();
      // const currentYear = currentTime.getFullYear();
      // const currentMonth = (currentTime.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based, so add 1
      // const currentDay = currentTime.getDate().toString().padStart(2, '0');
      
      // const formattedDate = `${currentYear}-${currentMonth}-${currentDay}`;
      // console.log(formattedDate);

        if(data.id) {
          let findPost = await this.BroadcastPostRepository.findOne({where: {id: data.id},relations: ['status']})
          if(data.is_draft && data.is_draft === "false") {
            findPost.is_draft = false
          }
          else if(data.is_draft && data.is_draft === "true"){
            findPost.is_draft = true
          }

          if(data.is_edited && data.is_edited === "true") {
            findPost.is_edited = true
            findPost.status.id = 1
          }
            
            if(data.title) {
              findPost.title = data.title
            }
            if(data.description) {
              findPost.description = data.description
            }
            if(data.what_are_you_promoting) {
                findPost.what_are_you_promoting = data.what_are_you_promoting
            }
            if(data.coupon_code) {
                findPost.coupon_code = data.coupon_code
            }
            if(data.valid_from) {
              findPost.valid_from = data.valid_from
            }
            else {
              findPost.valid_from = await this.MiddlewareService.getNearestMinute()//new Date()
            }
            findPost.modified_on = await this.MiddlewareService.getEasternTime()
            let updatePost = await this.BroadcastPostRepository.save(findPost)
            // if(data.file) {
            //   let filePath = 'uploads/Broadcasts/' + findPost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname

            //   let findFile = await this.BroadcastPostMediaRepository.findOne({where: {broadcastPost: {id: data.id}}})
            //   if(findFile) {
            //     let deleteImage = await this.FileUploadService.deleteImageFromS3(findFile.media_path)
            //     let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
            //     findFile.media_path = filePath
            //     findFile.media_type = data.file.mimetype
            //     let uploadFile = await this.BroadcastPostMediaRepository.save(findFile)
            //   }
            //   else {

            //     let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
            //     let fileData = {
            //       media_type: data.file.mimetype,
            //       media_path: filePath,
            //       created_by: data.userId,
            //       modified_by: data.userId,
            //       broadcastPost: {id: findPost.id}
            //     }
            //     //console.log("fileData---",fileData)  //comment later
            //     let uploadFile = await this.BroadcastPostMediaRepository.save(fileData)
            //   }
            // }

            if(data.file){  
              for(let i = 0; i < data.file.length; i ++) {
                let filePath = 'uploads/Broadcasts/' + updatePost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file[i].originalname
                let uploadToS3 = await this.FileUploadService.upload(data.file[i],filePath)
                let fileData = {
                  media_type: data.file[i].mimetype,
                        media_path: filePath,
                        created_by: data.userId,
                        modified_by: data.userId,
                        broadcastPost: {id: findPost.id}
                }
                //console.log("fileData---",fileData)  //comment later
                let uploadFile = await this.BroadcastPostMediaRepository.save(fileData)
              }
            }
            if(data.is_draft && data.is_draft === "false") {
              let notifyUser = await this.NotificationService.createAdminNotification(4,"Broadcast",updatePost.id,data.userId)  
            }
            return updatePost
        }
        else {
      
          let saveData = {
            user: data.userId,
            created_by: data.userId,
            modified_by: data.userId,
            title: data.title,
            description: data.description,
            what_are_you_promoting: data.what_are_you_promoting,
            status: {id: 1}, 
            expires_at : await this.MiddlewareService.getEasternTime(),//new Date(),
            // post_duration: data.post_duration,
            posted_time: await this.MiddlewareService.getEasternTime(),  //new Date(),
            created_on: await this.MiddlewareService.getEasternTime(),
            modified_on: await this.MiddlewareService.getEasternTime()
            //valid_from: data.valid_from
          }

          if(data.post_duration) {
            saveData["post_duration"]= data.post_duration
          }
          else {
            saveData["post_duration"]= "Broadcast Plan for 1 Week"
          }

          if(data.coupon_code) {
            saveData['coupon_code']=  data.coupon_code
          }

          if(data.valid_from) {
            saveData['valid_from'] = data.valid_from
          }
          else {
            saveData['valid_from'] = await this.MiddlewareService.getNearestMinute()//new Date()
          }
      
          if(data.is_draft && data.is_draft == 'false') {
            saveData['is_draft'] = false
           // saveData['expires_at'] = currentDate
          }
          else {
            saveData['is_draft'] = true
          }
          //console.log("addPost---",saveData)
            let addPost = await this.BroadcastPostRepository.save(saveData)
            //console.log("addPost---",addPost) //comment later
            //let splitImagePaths = data.image_path.split(";")
            // for(let i = 0; i < files.length; i ++) {
              // let filePath = 'uploads/Broadcasts/' + addPost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
              // let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
              // let fileData = {
              //   media_type: data.file.mimetype,
              //   media_path: filePath,
              //   created_by: data.userId,
              //   modified_by: data.userId,
              //   broadcastPost: {id: addPost.id}
              // }
             
              //console.log("fileData---",fileData)  //comment later
              //let uploadFile = await this.BroadcastPostMediaRepository.save(fileData)
           // }

         if(data.file){  
          for(let i = 0; i < data.file.length; i ++) {
            let filePath = 'uploads/Broadcasts/' + addPost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file[i].originalname
            let uploadToS3 = await this.FileUploadService.upload(data.file[i],filePath)
            let fileData = {
              media_type: data.file[i].mimetype,
              media_path: filePath,
              created_by: data.userId,
              modified_by: data.userId,
              broadcastPost: {id: addPost.id}
            }
            //console.log("fileData---",fileData)  //comment later
            let uploadFile = await this.BroadcastPostMediaRepository.save(fileData)
          }
        }
        if(data.is_draft && data.is_draft === "false") {
          let notifyUser = await this.NotificationService.createAdminNotification(4,"Broadcast",addPost.id,data.userId)  
        }
             return addPost
        }
        }

        async findAll(filters,userId) {

            const todayRange = await this.MiddlewareService.getToday();
        
            const currentWeekRange = await this.MiddlewareService.getCurrentWeek();
        
            const currentMonthRange = await this.MiddlewareService.getCurrentMonth();

            const lastMonthRange = await this.MiddlewareService.getLastMonth()
        
            const currentDate = await this.MiddlewareService.getEasternTime();
            //console.log("nearestMinute--", await this.MiddlewareService.getNearestMinute())
        
        let queryBuilder = this.BroadcastPostRepository
          .createQueryBuilder('broadcast_post')
          .leftJoinAndSelect('broadcast_post.user', 'user')
          .leftJoinAndSelect('broadcast_post.status', 'status')
          //.leftJoinAndSelect('broadcast_post.beehiveCategory', 'beehiveCategory')
          .select([
            'broadcast_post.id',
            'broadcast_post.title',
            'broadcast_post.description',
            'broadcast_post.is_draft',
            //'broadcast_post.company_name',
            'broadcast_post.coupon_code',
            'broadcast_post.valid_from',
            'broadcast_post.valid_upto',
            'broadcast_post.expires_at',
            'broadcast_post.posted_time',
            'user.id',
            'user.user_name',
            'user.image_path',
            'status.id',
            'status.key',
          ])
          .where('broadcast_post.is_draft = :isDraft', { isDraft: false })
          .andWhere('broadcast_post.is_deleted = :isDeleted', { isDeleted: false })
          .andWhere('broadcast_post.status = :status', { status: 3 })
          .andWhere('broadcast_post.valid_from <= :currentDate', { currentDate })
          .andWhere('broadcast_post.valid_upto >= :currentDate', { currentDate })
          //.andWhere('broadcast_post.valid_upto >= :currentDate', { currentDate: currentDate });
          // .andWhere('broadcast_post.valid_from >= :currentDate AND broadcast_post.valid_upto <= :currentDate', {
          //       currentDate: currentDate
          //     })

        if (filters.search && filters.search!= "") {
          let q = filters.search
          queryBuilder = queryBuilder.andWhere('user.user_name ILIKE :q', { q: `%${q}%` });
        }
        
        // if (filters.categoryId && filters.categoryId.length > 0) {
        //   let categoryIds = filters.categoryId
        //   if(categoryIds.length >= 1) {
        //     categoryIds = [filters.categoryId]
        //   }
        //   queryBuilder = queryBuilder.andWhere('beehiveCategory.id IN (:...categoryIds)', { categoryIds: categoryIds });
        // }
        
        if (filters.dates) {
          switch (filters.dates) {
            case 'today':
              queryBuilder = queryBuilder.andWhere('broadcast_post.valid_from >= :todayStart AND broadcast_post.valid_from <= :todayEnd', {
                todayStart: todayRange.start,
                todayEnd: todayRange.end
              });
              break;
            case 'this_week':
              queryBuilder = queryBuilder.andWhere('broadcast_post.valid_from >= :weekStart AND broadcast_post.valid_from <= :weekEnd', {
                weekStart: currentWeekRange.start,
                weekEnd: currentWeekRange.end
              });
              break;
            case 'this_month':
              queryBuilder = queryBuilder.andWhere('broadcast_post.valid_from >= :monthStart AND broadcast_post.valid_from <= :monthEnd', {
                monthStart: currentMonthRange.start,
                monthEnd: currentMonthRange.end
              });
              break;
            case 'last_month':
              queryBuilder = queryBuilder.andWhere('broadcast_post.posted_time >= :monthStart AND broadcast_post.posted_time <= :monthEnd', {
                monthStart: lastMonthRange.start,
                monthEnd: lastMonthRange.end
              });
    break;
          }
        }
        // else {
        //   queryBuilder = queryBuilder.andWhere('broadcast_post.expires_at >= :currentDate', { currentDate: currentDate });
        // }
        // else {
        //   queryBuilder = queryBuilder.andWhere('broadcast_post.valid_from >= :currentDate AND broadcast_post.expires_at <= :currentDate', {
        //     currentDate: currentDate
        //   });
        // }
        
        const AllPosts = await queryBuilder
          .orderBy('broadcast_post.modified_on', 'DESC')
          .getMany();
          
          // const nextMinute = getNextMinute();
          // console.log("Time for the next minute:", nextMinute);

                  for(let i = 0; i < AllPosts.length; i ++) {
                let AllMedia = await this.findAllMedia(AllPosts[i].id)
                AllPosts[i]['media'] = AllMedia
                AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(await this.findBroadcastPostUserImage(AllPosts[i].user.id))
                // if(AllPosts[i].user.image_path != null) {
                //   AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].user.image_path)
                // }
                // let likesCount = await this.getLikeCount(AllPosts[i].id)
                // AllPosts[i]['likesCount'] = likesCount.like_count
        
                // let checkLiked = await this.BeehivePostTrackingRepository.findOne({where: {beehivePost: {id: AllPosts[i].id},user: {id: userId},is_liked : true}})
                // if(checkLiked) {
                //   AllPosts[i]['liked'] = true
                // }
                // else {
                //   AllPosts[i]['liked'] = false
                // }
                // let checkSaved = await this.BeehivePostTrackingRepository.findOne({where: {beehivePost: {id: AllPosts[i].id},user: {id: userId},is_saved : true}})
                // if(checkSaved) {
                //   AllPosts[i]['saved'] = true
                // }
                // else {
                //   AllPosts[i]['saved'] = false
                // }
                // else {
                //   AllPosts[i].user.image_path = 'http://dev.lmclubclub.com/public/userProfile.png'
                // }
        
        
              }
          return AllPosts
        }

        async findAllMedia(id) {
            //let returnData =  await this.PostMediaRepository.find({where: {post: {id: id}}});
            const returnData = await this.BroadcastPostMediaRepository
              .createQueryBuilder('broadcast_post_media')
              .select(['broadcast_post_media.id', 'broadcast_post_media.media_path', 'broadcast_post_media.media_type'])
              .where({broadcastPost: {id:id}})
              .getMany();
            for (let p = 0; p < returnData.length; p ++) {
              returnData[p].media_path = await this.FileUploadService.generateCloudFrontUrl(returnData[p].media_path)
            }
             return returnData
    }

    async findBroadcastPostUserImage(id) {
      let businessUser = await this.BusinessUserDetailRepository.findOne({where: {user: {id: id}}})
      return businessUser.logo_image_path
    }

    async findPost(id) {
        const Post = await this.BroadcastPostRepository
          .createQueryBuilder('broadcast_post')
          .leftJoinAndSelect('broadcast_post.user', 'user')
        .leftJoinAndSelect('broadcast_post.status', 'status')
        //.leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
        .select(['broadcast_post.id','broadcast_post.title','broadcast_post.description','broadcast_post.is_draft','broadcast_post.coupon_code','broadcast_post.valid_from','broadcast_post.valid_upto','broadcast_post.posted_time','broadcast_post.expires_at','broadcast_post.what_are_you_promoting','broadcast_post.post_duration','broadcast_post.is_edited','user.id','user.user_name','user.image_path','status.id','status.key'])
          .where({id:id})
          .getOne();
        let PostMedia = await this.findAllMedia(id)
        Post['media'] = PostMedia
        // if(Post.user.image_path != null) {
        //   Post.user.image_path = await this.FileUploadService.generateCloudFrontUrl(Post.user.image_path)
        // }
         Post.user.image_path = await this.FileUploadService.generateCloudFrontUrl(await this.findBroadcastPostUserImage(Post.user.id))

        if(Post.post_duration) {
          let setting = await this.SettingsRepository.findOne({where: {flag: Post.post_duration}})
          Post['postDurationId'] = setting.id
        }
        Post['expired'] = false
        // else {
        //   Post.user.image_path = 'http://dev.lmclubclub.com/public/userProfile.png'
        // }
        return Post;
}

async findMyPosts(filters,userId) {

  const todayRange = await this.MiddlewareService.getToday();

  const currentWeekRange = await this.MiddlewareService.getCurrentWeek();

  const currentMonthRange = await this.MiddlewareService.getCurrentMonth();

  const lastMonthRange = await this.MiddlewareService.getLastMonth()

  const currentDate = await this.MiddlewareService.getEasternTime();

let queryBuilder = this.BroadcastPostRepository
.createQueryBuilder('broadcast_post')
.leftJoinAndSelect('broadcast_post.user', 'user')
.leftJoinAndSelect('broadcast_post.status', 'status')
//.leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
.select([
  'broadcast_post.id',
  'broadcast_post.title',
  'broadcast_post.description',
  'broadcast_post.is_draft',
  //'beehive_post.company_name',
  'broadcast_post.coupon_code',
  'broadcast_post.valid_from',
  'broadcast_post.valid_upto',
  'broadcast_post.expires_at',
  'broadcast_post.posted_time',
  'user.id',
  'user.user_name',
  'user.image_path',
  'status.id',
  'status.key',
  'broadcast_post.is_edited',
  //'beehiveCategory.category_name'
])
//.where('beehive_post.is_draft = :isDraft', { isDraft: false })
.andWhere('broadcast_post.is_deleted = :isDeleted', { isDeleted: false })
//.andWhere('beehive_post.status = :status', { status: 3 })
.andWhere('broadcast_post.user_id = :userId', { userId })

if (filters.dates) {
switch (filters.dates) {
  case 'today':
    queryBuilder = queryBuilder.andWhere('broadcast_post.posted_time >= :todayStart AND broadcast_post.posted_time <= :todayEnd', {
      todayStart: todayRange.start,
      todayEnd: todayRange.end
    });
    break;
  case 'this_week':
    queryBuilder = queryBuilder.andWhere('broadcast_post.posted_time >= :weekStart AND broadcast_post.posted_time <= :weekEnd', {
      weekStart: currentWeekRange.start,
      weekEnd: currentWeekRange.end
    });
    break;
  case 'this_month':
    queryBuilder = queryBuilder.andWhere('broadcast_post.posted_time >= :monthStart AND broadcast_post.posted_time <= :monthEnd', {
      monthStart: currentMonthRange.start,
      monthEnd: currentMonthRange.end
    });
    break;
  case 'last_month':
    queryBuilder = queryBuilder.andWhere('broadcast_post.posted_time >= :monthStart AND broadcast_post.posted_time <= :monthEnd', {
      monthStart: lastMonthRange.start,
      monthEnd: lastMonthRange.end
    });
    break;
}
}

const AllPosts = await queryBuilder
.orderBy('broadcast_post.modified_on', 'DESC')
.getMany();

        for(let i = 0; i < AllPosts.length; i ++) {

          
          if (AllPosts[i].status.id === 3 && AllPosts[i].valid_upto < await this.MiddlewareService.getEasternTime()){ //new Date()
            AllPosts[i]["expired"] = true
          }
          else {
            AllPosts[i]["expired"] = false
          }

      let AllMedia = await this.findAllMedia(AllPosts[i].id)
      AllPosts[i]['media'] = AllMedia
      // if(AllPosts[i].user.image_path != null) {
      //   AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].user.image_path)
      // }
      AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(await this.findBroadcastPostUserImage(AllPosts[i].user.id))
    }
return AllPosts
}

async shareBroadcastPost(data) {
  let findReward
  findReward = await this.RewardPointsMasterRepository.findOne({where: {reward_type: data.mode_of_share}})
   if(!findReward) {
    findReward = await this.RewardPointsMasterRepository.findOne({where: {id: 13}})
   }
   let findTrackingPost = await this.BroadcastPostTrackingRepository.findOne({where: {user: {id: data.userId},broadcastPost: {id: data.postId},mode_of_share: data.mode_of_share}})
   let broadcastPost = await this.BroadcastPostRepository.findOne({where: {id: data.postId}})
   if (findTrackingPost) {
     return null
   }
   else {
     let trackingData = {
      user: {id: data.userId},
      broadcastPost: {id: data.postId},
      is_shared: true,
      mode_of_share: data.mode_of_share,
      created_by: data.userId,
      modified_by: data.userId
     }
     let saveTrackingInfo = await this.BroadcastPostTrackingRepository.save(trackingData)

     let rewardData = {
      user: {id: data.userId},
      broadcastPostTracking: {id: saveTrackingInfo.id},
      points: findReward.points,
      transaction_type: "C",
      created_by: data.userId,
      modified_by: data.userId,
      transaction_date: new Date()
     }
     let saveRewardInfo = await this.BroadcastRewardTransactionRepository.save(rewardData)
     //postName,shareType,points
     let createShareNotification = await this.NotificationService.createShareRewardNotification(data.userId,broadcastPost.title,data.mode_of_share,findReward.points,data.postId)
     return saveRewardInfo
   }
}

// async myShares(userId) {
//   let AllPosts = await this.BroadcastRewardTransactionRepository
//   .createQueryBuilder('broadcast_reward_transaction')
//   .leftJoinAndSelect('broadcast_reward_transaction.broadcastPostTracking', 'broadcastPostTracking')
//   // .leftJoinAndSelect('broadcastPostTracking.user', 'likedUser')
//   .leftJoinAndSelect('broadcastPostTracking.broadcastPost', 'broadcastPost')
//   .leftJoinAndSelect('broadcastPost.user', 'broadcastPostUser')
//   .leftJoinAndSelect('broadcast_reward_transaction.user', 'user')
//   .select([
//     'broadcast_reward_transaction.id','broadcast_reward_transaction.transaction_date','broadcast_reward_transaction.transaction_type','broadcast_reward_transaction.source',
//     'broadcast_reward_transaction.points','broadcast_reward_transaction.is_active','broadcastPostTracking.id','broadcastPostTracking.is_created','broadcastPostTracking.is_shared','broadcastPostTracking.mode_of_share','user.id','user.user_name',//'likedUser.id','likedUser.user_name',
//     'broadcastPost.id','broadcastPost.title','broadcastPost.description','broadcastPost.coupon_code','broadcastPostUser.id','broadcastPostUser.user_name','broadcastPostUser.image_path'  //'user.image_path'
//   ]) //
//   .where({
//     is_active: true,
//     user: {id: userId}
//   })
//   .orderBy('broadcast_reward_transaction.created_on', 'DESC')
//   .getMany();

//   for(let i = 0; i < AllPosts.length; i ++) {
//     let AllMedia = await this.findAllMedia(AllPosts[i].broadcastPostTracking.broadcastPost.id)
//     AllPosts[i]['media'] = AllMedia
//     if(AllPosts[i].broadcastPostTracking.broadcastPost.user.image_path != null) {
//       AllPosts[i].broadcastPostTracking.broadcastPost.user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].broadcastPostTracking.broadcastPost.user.image_path)
//     }
//   }

//   return AllPosts
// }

async myShares(userId) {
  let AllPosts = await this.BroadcastPostTrackingRepository
  .createQueryBuilder('broadcast_post_tracking')
  // .leftJoinAndSelect('broadcastPostTracking.user', 'likedUser')
  .leftJoinAndSelect('broadcast_post_tracking.broadcastPost', 'broadcastPost')
  .leftJoinAndSelect('broadcastPost.user', 'broadcastPostUser')
  .select([
    'broadcast_post_tracking.id','broadcast_post_tracking.is_created','broadcast_post_tracking.is_shared','broadcast_post_tracking.mode_of_share',//'user.id','user.user_name',//'likedUser.id','likedUser.user_name',
    'broadcastPost.id','broadcastPost.title','broadcastPost.description','broadcastPost.coupon_code','broadcastPostUser.id','broadcastPostUser.user_name','broadcastPostUser.image_path'  //'user.image_path'
  ]) //
  .where({
    is_active: true,
    user: {id: userId},
    is_shared: true
  })
  .orderBy('broadcast_post_tracking.created_on', 'DESC')
  .getMany();

  for(let i = 0; i < AllPosts.length; i ++) {
    let AllMedia = await this.findAllMedia(AllPosts[i].broadcastPost.id)
    AllPosts[i]['media'] = AllMedia
    // if(AllPosts[i].broadcastPost.user.image_path != null) {
    //   AllPosts[i].broadcastPost.user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].broadcastPost.user.image_path)
    // }
    AllPosts[i].broadcastPost.user.image_path = await this.FileUploadService.generateCloudFrontUrl(await this.findBroadcastPostUserImage(AllPosts[i].broadcastPost.user.id))
  }

  return AllPosts
}
}
