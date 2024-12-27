// braintree.service.ts
import { Injectable } from '@nestjs/common';
import { BeehivePost } from 'src/models/beehivePost.entity'; 
import { BeehivePostMedia } from 'src/models/beehivePostMedia.entity'; 
import { BeehivePostTracking } from 'src/models/beehivePostTracking.entity'; 
import { BeehiveRewardTransaction } from 'src/models/beehiveRewardTransaction.entity'; 
import { BeehiveCategoryMaster } from 'src/models/beehiveCategoryMaster.entity';
import { Settings } from 'src/models'; 
import { RewardPointsMaster } from 'src/models';
import { NotificationService } from 'src/notification/notification.service';

import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from 'src/middleware/middleware.service';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, Like, MoreThanOrEqual, In } from 'typeorm';
import { WidgetService } from 'src/masters/widget.service';


@Injectable()
export class BeehivePostService {

constructor(
     @InjectRepository(BeehivePost)
  private BeehivePostRepository: Repository<BeehivePost>,

  @InjectRepository(BeehivePostMedia)
  private BeehivePostMediaRepository: Repository<BeehivePostMedia>,

  @InjectRepository(BeehivePostTracking)
  private BeehivePostTrackingRepository: Repository<BeehivePostTracking>,

  @InjectRepository(BeehiveRewardTransaction)
  private BeehiveRewardTransactionRepository: Repository<BeehiveRewardTransaction>,

  @InjectRepository(BeehiveCategoryMaster)
  private BeehiveCategoryMasterRepository: Repository<BeehiveCategoryMaster>,

  @InjectRepository(Settings)
  private SettingsRepository: Repository<Settings>,

  @InjectRepository(RewardPointsMaster)
  private RewardPointsMasterRepository: Repository<RewardPointsMaster>,

  private readonly FileUploadService: FileUploadService,
  private readonly MiddlewareService: MiddlewareService,
  private readonly NotificationService: NotificationService,
  private readonly WidgetService: WidgetService
) {}

async uploadBeehivePost(data) {

  let expireDays = await this.SettingsRepository.findOne({where: {id: 2}}) //comment later
  const currentDate = await this.MiddlewareService.getEasternTime()   // new Date(); //comment later
  currentDate.setDate(currentDate.getDate() + Number(expireDays.key)) //comment later
   // console.log("data---", data)

   if(data.id) {
   // console.log("id---")
    let findPost = await this.BeehivePostRepository.findOne({where: {id: data.id}})

    if(data.title) {
      findPost.title = data.title
    }
    if(data.description) {
      findPost.description = data.description
    }
    if(data.is_draft == "false") {
     //console.log("-------false")
     findPost.is_draft = false
    // findPost.expires_at = currentDate  // comment later, for admin approval

      let trackingData = {
        user: data.userId,
        beehivePost: {id: findPost.id},
        is_created: true,
        created_by: data.userId,
        modified_by: data.userId
    }
  let trackingPost = await this.BeehivePostTrackingRepository.save(trackingData)
  // let getPoints = await this.RewardPointsMasterRepository.findOne({where: {id: 2}})
  // let pointsData = {
  //     user: data.userId,
  //     beehivePostTracking: {id: trackingPost.id},
  //     transaction_date: new Date(),
  //     transaction_type: "C",
  //     points: Number(getPoints.points)
  // }
  // let savePointsData = await this.BeehiveRewardTransactionRepository.save(pointsData)
    } 
    if(data.coupon_code) {
      findPost.coupon_code = data.coupon_code
    }
    if(data.valid_from) {
      findPost.valid_from = data.valid_from
    }
    if(data.valid_upto) {
      findPost.valid_upto = data.valid_upto
    }
    if(data.company_name) {
      findPost.company_name = data.company_name
    }
    if(data.event_start_time) {
      findPost.event_start_time = data.event_start_time
    }
    if(data.event_end_time) {
      findPost.event_end_time = data.event_end_time
    }
    // if(data.file) {
    //   let imagePath = 'uploads/BeehivePosts/' + findPost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
    //   let findMedia = await this.BeehivePostMediaRepository.findOne({where: {beehivePost: {id: findPost.id}}})
    //   if(findMedia) { //.media_path != null || findMedia.media_path != ""
    //     let deleteImage = await this.FileUploadService.deleteImageFromS3(findMedia.media_path)
    //      if(deleteImage == true) {
    //        let uploadImage = await this.FileUploadService.upload(data.file,imagePath)
    //        findMedia.media_path = imagePath
    //        let saveImage = await this.BeehivePostMediaRepository.save(findMedia)
    //      }
    //   }
    //   else {
    //     let uploadToS3 = await this.FileUploadService.upload(data.file,imagePath)
    //     let fileData = {
    //       media_type: data.file.mimetype,
    //       media_path: imagePath,
    //       created_by: data.userId,
    //       modified_by: data.userId,
    //       beehivePost: {id: findPost.id}
    //     }
    //     let uploadFile = await this.BeehivePostMediaRepository.save(fileData)
    //   }
      
    //   //console.log("uploadFile---",uploadFile)
    // }
    //console.log("updatePost---",findPost)
    findPost.modified_on = await this.MiddlewareService.getEasternTime()//new Date()
    let updateBeehivePost = await this.BeehivePostRepository.save(findPost)

    if(data.file){  
      for(let i = 0; i < data.file.length; i ++) {
        let filePath = 'uploads/BeehivePosts/' + updateBeehivePost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file[i].originalname
        let uploadToS3 = await this.FileUploadService.upload(data.file[i],filePath)
        let fileData = {
          media_type: data.file[i].mimetype,
                media_path: filePath,
                created_by: data.userId,
                modified_by: data.userId,
                beehivePost: {id: findPost.id}
        }
        //console.log("fileData---",fileData)  //comment later
        let uploadFile = await this.BeehivePostMediaRepository.save(fileData)
      }
    }

    if(data.is_draft && data.is_draft === "false") {
      let notifyUser = await this.NotificationService.createAdminNotification(3,"Beehive",updateBeehivePost.id,data.userId)  
    }

    return updateBeehivePost

   }
   else {
    let savePost = {
      user: data.userId,
      beehiveCategory: data.category,
      title: data.title,
      description: data.description,
      created_by: data.userId,
      modified_by: data.userId,
      posted_time: await this.MiddlewareService.getEasternTime(), //new Date(),
      status: {id: 1},
      expires_at: await this.MiddlewareService.getEasternTime(),
      created_on: await this.MiddlewareService.getEasternTime(),
      modified_on: await this.MiddlewareService.getEasternTime()
       //new Date()
     // status: {id: 3}  // comment this later and uncomment above line
  }

  if(data.is_draft == "false") {

      savePost['is_draft'] = false
      //savePost['expires_at'] = new Date() //currentDate  // comment later, for admin approval
  }
  else {
      savePost['is_draft'] = true
      //savePost['expires_at'] = new Date()
  }
  
  if(data.coupon_code) {
      savePost['coupon_code'] = data.coupon_code
      savePost['valid_upto'] = data.valid_upto
  }

  if(data.valid_from) {
    savePost["valid_from"]= data.valid_from
  }

  if(data.valid_upto) {
    savePost['valid_upto'] = data.valid_upto
  }

  if(data.company_name) {
      savePost['company_name'] = data.company_name
  }

  if(data.event_start_time) {
    savePost['event_start_time'] = data.event_start_time
  }

  if(data.event_end_time) {
    savePost['event_end_time'] = data.event_end_time
  } 

  if(data.category && data.valid_from && data.valid_upto) {
    let findCategory = await this.BeehiveCategoryMasterRepository.findOne({where: {id: data.category}})
    if(findCategory.category_name === "Events") {
      savePost["valid_from"]= data.valid_from + " " + data.event_start_time
      savePost["valid_upto"]= data.valid_upto + " " + data.event_end_time
    }
  }
  
  
  let saveBeehivePost = await this.BeehivePostRepository.save(savePost)


//console.log("saveBeehivePost---",saveBeehivePost)
  // if(data.file) {
  //     let filePath = 'uploads/BeehivePosts/' + saveBeehivePost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
  //     let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
  //     let fileData = {
  //       media_type: data.file.mimetype,
  //       media_path: filePath,
  //       created_by: data.userId,
  //       modified_by: data.userId,
  //       beehivePost: {id: saveBeehivePost.id}
  //     }
  //     let uploadFile = await this.BeehivePostMediaRepository.save(fileData)
  //     //console.log("uploadFile---",uploadFile)
  // }
  if(data.file){  
    for(let i = 0; i < data.file.length; i ++) {
      let filePath = 'uploads/BeehivePosts/' + saveBeehivePost.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file[i].originalname
      let uploadToS3 = await this.FileUploadService.upload(data.file[i],filePath)
      let fileData = {
        media_type: data.file[i].mimetype,
              media_path: filePath,
              created_by: data.userId,
              modified_by: data.userId,
              beehivePost: {id: saveBeehivePost.id}
      }
      //console.log("fileData---",fileData)  //comment later
      let uploadFile = await this.BeehivePostMediaRepository.save(fileData)
    }
  }

  if(data.is_draft == "false") {
      let trackingData = {
          user: data.userId,
          beehivePost: {id: saveBeehivePost.id},
          is_created: true,
          created_by: data.userId,
          modified_by: data.userId
      }
    let trackingPost = await this.BeehivePostTrackingRepository.save(trackingData)
  // let getPoints = await this.RewardPointsMasterRepository.findOne({where: {id: 2}})
  //   let pointsData = {
  //       user: data.userId,
  //       beehivePostTracking: {id: trackingPost.id},
  //       transaction_date: new Date(),
  //       transaction_type: "C",
  //       points: Number(getPoints.points)
  //   }
  //   let savePointsData = await this.BeehiveRewardTransactionRepository.save(pointsData)
  
    let notifyUser = await this.NotificationService.createAdminNotification(3,"Beehive",saveBeehivePost.id,data.userId)  
  
  }
  
  return saveBeehivePost
   } 
}


async findAll(filters,userId) {
   //console.log("getEasternTime", this.MiddlewareService.getEasternTime())
    const todayRange = await this.MiddlewareService.getToday();

    const currentWeekRange = await this.MiddlewareService.getCurrentWeek();

    const currentMonthRange = await this.MiddlewareService.getCurrentMonth();

    const lastMonthRange = await this.MiddlewareService.getLastMonth()

    const currentDate = await this.MiddlewareService.getEasternTime()  //new Date();

let queryBuilder = this.BeehivePostRepository
  .createQueryBuilder('beehive_post')
  .leftJoinAndSelect('beehive_post.user', 'user')
  .leftJoinAndSelect('beehive_post.status', 'status')
  .leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
  .select([
    'beehive_post.id',
    'beehive_post.title',
    'beehive_post.description',
    'beehive_post.is_draft',
    'beehive_post.company_name',
    'beehive_post.coupon_code',
    'beehive_post.valid_from',
    'beehive_post.valid_upto',
    'beehive_post.expires_at',
    'beehive_post.posted_time',
    'beehive_post.event_start_time',
    'beehive_post.event_end_time',
    'user.id',
    'user.user_name',
    'user.image_path',
    'status.id',
    'status.key',
    'beehiveCategory.category_name'
  ])
  .where('beehive_post.is_draft = :isDraft', { isDraft: false })
  .andWhere('beehive_post.is_deleted = :isDeleted', { isDeleted: false })
  .andWhere('beehive_post.status = :status', { status: 3 })
  .andWhere('beehive_post.valid_from <= :currentDate', { currentDate })
  .andWhere('beehive_post.valid_upto >= :currentDate', { currentDate })
  //.andWhere('beehive_post.expires_at >= :currentDate', { currentDate: currentDate });

if (filters.search && filters.search!= "") {
  let q = filters.search
  queryBuilder = queryBuilder.andWhere('user.user_name ILIKE :q', { q: `%${q}%` });
}

if (filters.categoryId && filters.categoryId.length > 0) {
  let categoryIds = filters.categoryId
  if(categoryIds.length >= 1) {
     if(typeof categoryIds === 'string') {
      categoryIds = [Number(categoryIds)]
     }
     else {
      for(let i = 0; i < categoryIds.length; i++ ) {
        categoryIds[i] = Number(categoryIds[i])
      }
     }

  }
  queryBuilder = queryBuilder.andWhere('beehiveCategory.id IN (:...categoryIds)', { categoryIds: categoryIds });
}

if (filters.dates) {
  switch (filters.dates) {
    case 'today':
      queryBuilder = queryBuilder.andWhere('beehive_post.valid_from >= :todayStart AND beehive_post.valid_from <= :todayEnd', {
        todayStart: todayRange.start,
        todayEnd: todayRange.end
      });
      break;
    case 'this_week':
      queryBuilder = queryBuilder.andWhere('beehive_post.valid_from >= :weekStart AND beehive_post.valid_from <= :weekEnd', {
        weekStart: currentWeekRange.start,
        weekEnd: currentWeekRange.end
      });
      break;
    case 'this_month':
      queryBuilder = queryBuilder.andWhere('beehive_post.valid_from >= :monthStart AND beehive_post.valid_from <= :monthEnd', {
        monthStart: currentMonthRange.start,
        monthEnd: currentMonthRange.end
      });
      break;
    case 'last_month':
      queryBuilder = queryBuilder.andWhere('beehive_post.valid_from >= :monthStart AND beehive_post.valid_from <= :monthEnd', {
        monthStart: lastMonthRange.start,
        monthEnd: lastMonthRange.end
      });
      break;
  }
}
// else {
//   queryBuilder = queryBuilder.andWhere('beehive_post.expires_at >= :currentDate', { currentDate: currentDate });
// }

const AllPosts = await queryBuilder
  .orderBy('beehive_post.created_on', 'DESC')
  .getMany();

          for(let i = 0; i < AllPosts.length; i ++) {
        let AllMedia = await this.findAllMedia(AllPosts[i].id)
        AllPosts[i]['media'] = AllMedia
        if(AllPosts[i].user.image_path != null) {
          AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].user.image_path)
        }
        //let likesCount = await this.getLikeCount(AllPosts[i].id)
        AllPosts[i]['likesCount'] = await this.getLikeCount(AllPosts[i].id)

        let checkLiked = await this.BeehivePostTrackingRepository.findOne({where: {beehivePost: {id: AllPosts[i].id},user: {id: userId},is_liked : true}})
        if(checkLiked) {
          AllPosts[i]['liked'] = true
        }
        else {
          AllPosts[i]['liked'] = false
        }
        let checkSaved = await this.BeehivePostTrackingRepository.findOne({where: {beehivePost: {id: AllPosts[i].id},user: {id: userId},is_saved : true}})
        if(checkSaved) {
          AllPosts[i]['saved'] = true
        }
        else {
          AllPosts[i]['saved'] = false
        }
        // else {
        //   AllPosts[i].user.image_path = 'http://dev.lmclubclub.com/public/userProfile.png'
        // }


      }
  return AllPosts
}

async getLikeCount(postId: number): Promise<number> {
const count = await this.BeehivePostTrackingRepository
      .createQueryBuilder('beehive_post_tracking')
      .select('COUNT(*)', 'like_count')
      .where('beehive_post_tracking.beehive_post_id = :postId', { postId })
      .andWhere('beehive_post_tracking.is_liked = :isLiked', { isLiked: true })
      .getRawOne();
      //return count
      return parseInt(count.like_count)
}

async findAllMedia(id: number) {
        //let returnData =  await this.PostMediaRepository.find({where: {post: {id: id}}});
        const returnData = await this.BeehivePostMediaRepository
          .createQueryBuilder('beehive_post_media')
          .select(['beehive_post_media.id', 'beehive_post_media.media_path', 'beehive_post_media.media_type'])
          .where({beehivePost: {id:id}})
          .getMany();
        for (let p = 0; p < returnData.length; p ++) {
          returnData[p].media_path = await this.FileUploadService.generateCloudFrontUrl(returnData[p].media_path)
        }
         return returnData
}

async findPost(id) {
        const Post = await this.BeehivePostRepository
          .createQueryBuilder('beehive_post')
          .leftJoinAndSelect('beehive_post.user', 'user')
        .leftJoinAndSelect('beehive_post.status', 'status')
        .leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
        .select(['beehive_post.id','beehive_post.title','beehive_post.description','beehive_post.is_draft','beehive_post.company_name','beehive_post.coupon_code','beehive_post.valid_from','beehive_post.valid_upto','beehive_post.posted_time','beehive_post.expires_at','beehive_post.event_start_time',
        'beehive_post.event_end_time','user.id','user.user_name','user.image_path','status.id','status.key','beehiveCategory.category_name'])
          .where({id:id})
          .getOne();
        let PostMedia = await this.findAllMedia(id)
        Post['media'] = PostMedia
        if(Post.user.image_path != null) {
          Post.user.image_path = await this.FileUploadService.generateCloudFrontUrl(Post.user.image_path)
        }

        if((Post.beehiveCategory.id ===  1 || Post.beehiveCategory.id === 3) && Post.valid_upto < await this.MiddlewareService.getEasternTime()) { //new Date()
          Post["expired"] = true
        }
        // else if ((Post.beehiveCategory.category_name !== "Coupons/Deals" || "Events") && Post.status.id === 3 && Post.valid_upto < new Date()){
        //   Post["expired"] = true
        // }
         else {
          Post["expired"] = false
        }
        // else {
        //   Post.user.image_path = 'http://dev.lmclubclub.com/public/userProfile.png'
        // }
        return Post;
}

// async findMyPosts(id) {
//         //let AllPosts =  await this.PostRepository.find({where: {user: {id: id},is_deleted: false},relations: ['status']});
//         const AllPosts = await this.BeehivePostRepository
//           .createQueryBuilder('beehive_post')
//           .leftJoinAndSelect('beehive_post.user', 'user')
//         .leftJoinAndSelect('beehive_post.status', 'status')
//         .leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
//         .select(['beehive_post.id','beehive_post.title','beehive_post.description','beehive_post.is_draft','beehive_post.company_name','beehive_post.coupon_code','beehive_post.valid_from','beehive_post.valid_upto','beehive_post.expires_at','user.id','user.user_name','user.image_path','status.id','status.key','beehiveCategory.category_name'])
//           .where({user: {id:id},is_deleted: false})
//           .orderBy('beehive_post.created_on', 'DESC')
//           .getMany();
//         for(let i = 0; i < AllPosts.length; i ++) {
//           let AllMedia = await this.findAllMedia(AllPosts[i].id)
//           AllPosts[i]['media'] = AllMedia
//           if(AllPosts[i].user.image_path != null) {
//             AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].user.image_path)
//           }
//           // else {
//           //   AllPosts[i].user.image_path = 'http://dev.lmclubclub.com/public/userProfile.png'
//           // }
//        }
//         return AllPosts
// }

async findMyPosts(filters,userId) {

  const todayRange = await this.MiddlewareService.getToday();

  const currentWeekRange = await this.MiddlewareService.getCurrentWeek();

  const currentMonthRange = await this.MiddlewareService.getCurrentMonth();

  const lastMonthRange = await this.MiddlewareService.getLastMonth()

  const currentDate = await this.MiddlewareService.getEasternTime()   //new Date();

let queryBuilder = this.BeehivePostRepository
.createQueryBuilder('beehive_post')
.leftJoinAndSelect('beehive_post.user', 'user')
.leftJoinAndSelect('beehive_post.status', 'status')
.leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
.select([
  'beehive_post.id',
  'beehive_post.title',
  'beehive_post.description',
  'beehive_post.is_draft',
  'beehive_post.company_name',
  'beehive_post.coupon_code',
  'beehive_post.valid_from',
  'beehive_post.valid_upto',
  'beehive_post.expires_at',
  'beehive_post.posted_time',
  'beehive_post.event_start_time',
  'beehive_post.event_end_time',
  'user.id',
  'user.user_name',
  'user.image_path',
  'status.id',
  'status.key',
  'beehiveCategory.category_name'
])
//.where('beehive_post.is_draft = :isDraft', { isDraft: false })
.andWhere('beehive_post.is_deleted = :isDeleted', { isDeleted: false })
//.andWhere('beehive_post.status = :status', { status: 3 })
.andWhere('beehive_post.user_id = :userId', { userId })


if (filters.categoryId && filters.categoryId.length > 0) {
let categoryIds = filters.categoryId
if(categoryIds.length >= 1) {
  if(typeof categoryIds === 'string') {
   categoryIds = [Number(categoryIds)]
  }
  else {
   for(let i = 0; i < categoryIds.length; i++ ) {
     categoryIds[i] = Number(categoryIds[i])
   }
  }

}
queryBuilder = queryBuilder.andWhere('beehiveCategory.id IN (:...categoryIds)', { categoryIds: categoryIds });
}

if (filters.dates) {
switch (filters.dates) {
  case 'today':
    queryBuilder = queryBuilder.andWhere('beehive_post.posted_time >= :todayStart AND beehive_post.posted_time <= :todayEnd', {
      todayStart: todayRange.start,
      todayEnd: todayRange.end
    });
    break;
  case 'this_week':
    queryBuilder = queryBuilder.andWhere('beehive_post.posted_time >= :weekStart AND beehive_post.posted_time <= :weekEnd', {
      weekStart: currentWeekRange.start,
      weekEnd: currentWeekRange.end
    });
    break;
  case 'this_month':
    queryBuilder = queryBuilder.andWhere('beehive_post.posted_time >= :monthStart AND beehive_post.posted_time <= :monthEnd', {
      monthStart: currentMonthRange.start,
      monthEnd: currentMonthRange.end
    });
    break;
  case 'last_month':
      queryBuilder = queryBuilder.andWhere('beehive_post.valid_from >= :monthStart AND beehive_post.valid_from <= :monthEnd', {
        monthStart: lastMonthRange.start,
        monthEnd: lastMonthRange.end
      });
      break;
}
}
// else {
// queryBuilder = queryBuilder.andWhere('beehive_post.expires_at >= :currentDate', { currentDate: currentDate });
// }

const AllPosts = await queryBuilder
.orderBy('beehive_post.created_on', 'DESC')
.getMany();

        for(let i = 0; i < AllPosts.length; i ++) {
          
      let AllMedia = await this.findAllMedia(AllPosts[i].id)
      AllPosts[i]['media'] = AllMedia
      if(AllPosts[i].user.image_path != null) {
        AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].user.image_path)
      }
      //let likesCount = await this.getLikeCount(AllPosts[i].id)
      AllPosts[i]['likesCount'] = await this.getLikeCount(AllPosts[i].id)

      if((AllPosts[i].beehiveCategory.id ===  3  || AllPosts[i].beehiveCategory.id ===  3) && AllPosts[i].valid_upto < await this.MiddlewareService.getEasternTime()) { //new Date()
        AllPosts[i]["expired"] = true
      }
      else if ((AllPosts[i].beehiveCategory.id !== 1 || AllPosts[i].beehiveCategory.id !== 3) && AllPosts[i].status.id === 3 && AllPosts[i].valid_upto < await this.MiddlewareService.getEasternTime()){  //new Date()
        AllPosts[i]["expired"] = true
      }
      else {
        AllPosts[i]["expired"] = false
      }
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
    }
return AllPosts
}

async likeBeehivePost(id,userId,type,action) {

  let getPoints = await this.RewardPointsMasterRepository.findOne({where: {reward_type: 'Like a Post'}})
  let findTrackingPost = await this.BeehivePostTrackingRepository.findOne({where: {user: {id: userId},beehivePost: {id: id}}})
  let getPostUser = await this.BeehivePostRepository.findOne({where: {id: id},relations: ['user']})
  // let notifyUser = await this.NotificationService.createNotification(userId,id,type)
  if(findTrackingPost) {
    //console.log("findTrackingPost",findTrackingPost)
     if(type == "like") {
      findTrackingPost.is_liked = action
      let saveTrack =  await this.BeehivePostTrackingRepository.save(findTrackingPost)
      let findLikeTransaction = await this.BeehiveRewardTransactionRepository.findOne({where: {beehivePostTracking: {id: findTrackingPost.id,user: {id: userId}}}})
      if(action === true) {
        let pointsData = {
          user: {id: getPostUser.user.id},
          beehivePostTracking: {id: findTrackingPost.id},
          transaction_date: new Date(),
          transaction_type: "C",
          points: Number(getPoints.points)
      }
      let savePointsData = await this.BeehiveRewardTransactionRepository.save(pointsData)
      }
      else {
        findLikeTransaction.is_active = action
        let updateLikeTransaction = await this.BeehiveRewardTransactionRepository.save(findLikeTransaction)
      }
      return saveTrack
     }
     else {
      findTrackingPost.is_saved = action
      return await this.BeehivePostTrackingRepository.save(findTrackingPost)
     }

  }
  else {
    //let notifyUser = await this.NotificationService.createNotification(userId,id,type)
    let saveData = {
      user: {id: userId},
      beehivePost: {id: id},
      created_by: userId,
      modified_by: userId
    }
    if(type == "like") {
      saveData['is_liked'] = action
      let savePost =  await this.BeehivePostTrackingRepository.save(saveData)
      
     let pointsData = {
        user: {id: getPostUser.user.id},
        beehivePostTracking: {id: savePost.id},
        transaction_date: new Date(),
        transaction_type: "C",
        points: Number(getPoints.points)
    }
    let savePointsData = await this.BeehiveRewardTransactionRepository.save(pointsData)
    let notifyUser = await this.NotificationService.createNotification(getPostUser.user.id,id,type)
    let notifyUser1 = await this.NotificationService.createBeehiveLikeRewardNotification(getPostUser.user.id,id,getPoints.points)
   return savePost
     }
     else {
      saveData['is_saved' ]= action
      return await this.BeehivePostTrackingRepository.save(saveData)
     }
  }
}

async getSavedBeehivePosts(filters,userId){

  const todayRange = await this.MiddlewareService.getToday();

  const currentWeekRange = await this.MiddlewareService.getCurrentWeek();

  const currentMonthRange = await this.MiddlewareService.getCurrentMonth();

  const lastMonthRange = await this.MiddlewareService.getLastMonth()

  const currentDate = await this.MiddlewareService.getEasternTime()  //new Date();

  let queryBuilder = await this.BeehivePostTrackingRepository.createQueryBuilder('beehive_post_tracking')
    .innerJoinAndSelect('beehive_post_tracking.beehivePost', 'beehivePost')
    .innerJoinAndSelect('beehivePost.user', 'user')
    .innerJoinAndSelect('beehivePost.status', 'status')
    .innerJoinAndSelect('beehivePost.beehiveCategory', 'beehiveCategory')
    .where('beehive_post_tracking.user_id = :userId', { userId })
    .andWhere('beehive_post_tracking.is_saved = true')
    .select([
      'beehive_post_tracking.id',
      'beehive_post_tracking.is_saved',
      'beehivePost.id',
      'beehivePost.title',
      'beehivePost.description',
      'beehivePost.is_draft',
      'beehivePost.company_name',
      'beehivePost.coupon_code',
      'beehivePost.valid_from',
      'beehivePost.valid_upto',
      'beehivePost.expires_at',
      'beehivePost.posted_time',
      'beehivePost.event_start_time',
      'beehivePost.event_end_time',
      'user.id',
      'user.user_name',
      'user.image_path',
      'status.id',
      'status.key',
      'beehiveCategory.category_name'
    ])


  if (filters.search) {
    let q = filters.search
    //console.log("q", q)
    //queryBuilder.andWhere('user.user_name = :q', { q });
    queryBuilder = queryBuilder.andWhere('user.user_name ILIKE :q', { q: `%${q}%` });
  }

  if (filters.categoryId && filters.categoryId.length > 0) {
    let categoryIds = filters.categoryId
    if(categoryIds.length >= 1) {
      if(typeof categoryIds === 'string') {
       categoryIds = [Number(categoryIds)]
      }
      else {
       for(let i = 0; i < categoryIds.length; i++ ) {
         categoryIds[i] = Number(categoryIds[i])
       }
      }
 
   }
    //console.log("filters.categoryIds===",filters.categoryId)
    queryBuilder = queryBuilder.andWhere('beehiveCategory.id IN (:...categoryIds)', { categoryIds: categoryIds });
  }

  if (filters.dates) {
    switch (filters.dates) {
      case 'today':
        queryBuilder = queryBuilder.andWhere('beehivePost.valid_from >= :todayStart AND beehivePost.valid_from <= :todayEnd', {
          todayStart: todayRange.start,
          todayEnd: todayRange.end
        });
        break;
      case 'this_week':
        queryBuilder = queryBuilder.andWhere('beehivePost.valid_from >= :weekStart AND beehivePost.valid_from <= :weekEnd', {
          weekStart: currentWeekRange.start,
          weekEnd: currentWeekRange.end
        });
        break;
      case 'this_month':
        queryBuilder = queryBuilder.andWhere('beehivePost.valid_from >= :monthStart AND beehivePost.valid_from <= :monthEnd', {
          monthStart: currentMonthRange.start,
          monthEnd: currentMonthRange.end
        });
        break;
      case 'last_month':
          queryBuilder = queryBuilder.andWhere('beehive_post.valid_from >= :monthStart AND beehive_post.valid_from <= :monthEnd', {
            monthStart: lastMonthRange.start,
            monthEnd: lastMonthRange.end
          });
          break;

      
    }
  }
  // else {
  //   queryBuilder = queryBuilder.andWhere('beehivePost.expires_at >= :currentDate', { currentDate: currentDate });
  // }

let AllPosts = await queryBuilder.orderBy('beehive_post_tracking.created_on', 'DESC').getMany();

for(let i = 0; i < AllPosts.length; i ++) {
  let AllMedia = await this.findAllMedia(AllPosts[i].beehivePost.id)
  AllPosts[i]['media'] = AllMedia
   //console.log("AllPosts[i].user.image_path ",AllPosts[i].beehivePost.user.id)
  if(AllPosts[i].beehivePost.user.image_path !== null || AllPosts[i].beehivePost.user.image_path !== "") {
    AllPosts[i].beehivePost.user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].beehivePost.user.image_path)
  }
  //let likesCount = await this.getLikeCount(AllPosts[i].beehivePost.id)
  AllPosts[i]['likesCount'] = await this.getLikeCount(AllPosts[i].id)

  let checkLiked = await this.BeehivePostTrackingRepository.findOne({where: {beehivePost: {id: AllPosts[i].beehivePost.id},user: {id: userId},is_liked : true}})
  if(checkLiked) {
    AllPosts[i]['liked'] = true
  }
  else {
    AllPosts[i]['liked'] = false
  }
  let checkSaved = await this.BeehivePostTrackingRepository.findOne({where: {beehivePost: {id: AllPosts[i].beehivePost.id},user: {id: userId},is_saved : true}})
  if(checkSaved) {
    AllPosts[i]['saved'] = true
  }
  else {
    AllPosts[i]['saved'] = false
  }
}
  return AllPosts
}
}




  //   const AllPosts = await this.BeehivePostRepository
  //     .createQueryBuilder('beehive_post')
  //     .leftJoinAndSelect('beehive_post.user', 'user')
  //     .leftJoinAndSelect('beehive_post.status', 'status')
  //     .leftJoinAndSelect('beehive_post.beehiveCategory', 'beehiveCategory')
  //     .select(['beehive_post.id','beehive_post.title','beehive_post.description','beehive_post.is_draft','beehive_post.company_name','beehive_post.coupon_code','beehive_post.valid_from','beehive_post.valid_upto','beehive_post.expires_at','user.id','user.user_name','user.image_path','status.id','status.key','beehiveCategory.category_name'])
  //     .where({
  //       is_draft: false,
  //       is_deleted: false,
  //       status: 3,
  //       expires_at: MoreThanOrEqual(currentDate)
  //     })
  //     .andWhere('user.user_name LIKE :user_name', { user_name: `%${us}%` })
  //     .orderBy('beehive_post.created_on', 'DESC')
  //     .getMany();
  //       for(let i = 0; i < AllPosts.length; i ++) {
  //       let AllMedia = await this.findAllMedia(AllPosts[i].id)
  //       AllPosts[i]['media'] = AllMedia
  //       if(AllPosts[i].user.image_path != null) {
  //         AllPosts[i].user.image_path = await this.FileUploadService.generateCloudFrontUrl(AllPosts[i].user.image_path)
  //       }
  //       else {
  //         AllPosts[i].user.image_path = 'http://dev.lmclubclub.com/public/userProfile.png'
  //       }
  //    }
  
  //   return AllPosts;

