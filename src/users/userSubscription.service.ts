import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { CreateUserDto,UserSubcriptionDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserSubscription } from '../models/userSubscription.entity';
import { SubscriptionWidgetMap } from '../models/subscriptionWidgetMap.entity';
import { FileUploadService } from 'src/middleware/s3.service';
import { ContentMaster } from 'src/models';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectRepository(UserSubscription)
    private UserSubscriptionRepository: Repository<UserSubscription>,

    @InjectRepository(SubscriptionWidgetMap)
    private SubscriptionWidgetMapRepository: Repository<SubscriptionWidgetMap>,

    private readonly FileUploadService: FileUploadService,

    @InjectRepository(ContentMaster)
    private ContentMasterRepository: Repository<ContentMaster>
    
  ) {}

 async subscribePlan(UserSubcriptionDto) {
  let userSubData = {
    user: UserSubcriptionDto.user_id,
    subscription: UserSubcriptionDto.subscription_id,
    subscription_from: UserSubcriptionDto.subscription_from,
  subscription_upto: UserSubcriptionDto.subscription_upto,
  created_by: UserSubcriptionDto.user_id,
  modified_by: UserSubcriptionDto.user_id
  }
    return this.UserSubscriptionRepository.save(userSubData);
  //return this.UserSubscriptionRepository.save(UserSubcriptionDto);
 }

 async findAllSubscriptions() {
  return this.UserSubscriptionRepository.find({relations: ["user", "subscription"]});
 }

 async findSubscriptionById(id) {
  let getUserSubscription = await this.UserSubscriptionRepository.findOne({where: {user: {id: id}},relations:["user", "subscription"]})
  //console.log("getUserSubscription---",getUserSubscription)
  return getUserSubscription;
}

async getContent(type) {
  let content 
  let tc
  if(type === "Beehive") {
    content = await this.ContentMasterRepository.findOne({where: {name: "Beehive Unlock Content"},select: ["content","name"]})
    tc = await this.ContentMasterRepository.findOne({where: {name: "Terms & Conditions Beehive"},select: ["content","name"]})
  }
  else if (type === "Broadcast") {
    content = await this.ContentMasterRepository.findOne({where: {name: "Broadcast Unlock Content"},select: ["content","name"]})
    tc = await this.ContentMasterRepository.findOne({where: {name: "Terms & Conditions Broadcast"},select: ["content","name"]})
  }
  else if (type === "Refer & Earn") {
    content = await this.ContentMasterRepository.findOne({where: {name: "Refer and Earn Unlock Content"},select: ["content","name"]})
    tc = await this.ContentMasterRepository.findOne({where: {name: "Terms & Conditions Refer and Earn"},select: ["content","name"]})
  }
  else if (type === "Broadcast Business") {
    content = await this.ContentMasterRepository.findOne({where: {name: "Broadcast Business Unlock Content"},select: ["content","name"]})
    tc = await this.ContentMasterRepository.findOne({where: {name: "Terms & Conditions Business Broadcast"},select: ["content","name"]})
  }
  return {
    content,tc
  }
   
}

async getSubscribedWidgets(id) {
  let getWidgets = await this.SubscriptionWidgetMapRepository.find({where: {subscriptionType: {id: id},is_active: true},relations:["widget"]})
  let widgetsArr = []
  
  for(let i = 0; i < getWidgets.length; i ++) {
    let widbject = {
      id: getWidgets[i].id,
      widget_name: getWidgets[i].widget.widget_name
    }
    let getContent = await this.getContent(getWidgets[i].widget.widget_name)
    widbject["content"]= getContent.content
    widbject["t&c"]= getContent.tc
    
    if(getWidgets[i].widget.image_path != null) {
      widbject['image_path'] = await this.FileUploadService.generateCloudFrontUrl(getWidgets[i].widget.image_path)
    }
    else {
      widbject['image_path'] = null
    }
    widgetsArr.push(widbject)
  }
  //console.log("widgetsArr---",widgetsArr)
  return widgetsArr
}

}