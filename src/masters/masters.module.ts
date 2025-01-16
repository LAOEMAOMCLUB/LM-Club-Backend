import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { CityService } from './city.service';
import { MastersController } from './masters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './../models/state.entity';
import { City } from  './../models/city.entity';
//import { CategoryMaster } from './../models/category.entity';
//import { CategoryService } from './category.service';
import { SubscriptionType } from '../models/subscriptionType.entity';
import { SubscriptionService } from './subscription.service';
import { WidgetService } from './widget.service';
import { WidgetMaster } from '../models/widget.entity';
//import { SubCategoryService } from './subcategory.service';
//import { SubCategory } from '../models/subCategory.entity';
import { SubscriptionWidgetMap } from '../models/subscriptionWidgetMap.entity';
import { Settings } from 'src/models';
import { FileUploadService } from 'src/middleware/s3.service';
import { SettingsService } from './settings.service';
import { EmailTemplateService } from './emailTemplate.service';
import { EmailTemplate } from '../models/emailTemplate.entity';
import { BeehiveCategoryMasterService } from './beehiveCategory.service';
import { BeehiveCategoryMaster } from 'src/models';
import { RewardPointsMasterService } from "./rewardPoints.service"
import { RewardPointsMaster } from "src/models";
import { MiddlewareService } from "./../middleware/middleware.service";
import { ContentMaster } from 'src/models';
import { contentMasterService } from './contentMaster.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContentMaster,RewardPointsMaster,BeehiveCategoryMaster,State,City,SubscriptionType,WidgetMaster,SubscriptionWidgetMap,Settings,EmailTemplate])],
  controllers: [MastersController],
  providers: [contentMasterService,StateService,CityService,SubscriptionService,WidgetService,FileUploadService,SettingsService,EmailTemplateService,BeehiveCategoryMasterService,RewardPointsMasterService,MiddlewareService],
  exports: [StateService,CityService,SubscriptionService,WidgetService],
})
export class MastersModule {}
