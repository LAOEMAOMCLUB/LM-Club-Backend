import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WidgetMaster } from '../models/widget.entity';
import { SubscriptionWidgetMap } from 'src/models';
import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from "./../middleware/middleware.service"

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(WidgetMaster)
    private widgetRepository: Repository<WidgetMaster>,

    @InjectRepository(SubscriptionWidgetMap)
    private SubscriptionWidgetMapRepository: Repository<SubscriptionWidgetMap>,

    private readonly FileUploadService: FileUploadService,
    private readonly MiddlewareService: MiddlewareService
  ) {}

  async findAllWidgets() {
    let allWidgets = await this.widgetRepository.find({order: {
      modified_on: 'DESC', 
    }})
    for(let i = 0; i < allWidgets.length; i ++) {
      if(allWidgets[i].image_path != null) {
  // let splitImagePath = allWidgets[i].image_path.split("/")[2]
  // allWidgets[i].image_path = "http://dev.lmclubclub.com/public/widgets/" + splitImagePath
  allWidgets[i].image_path = await this.FileUploadService.generateCloudFrontUrl(allWidgets[i].image_path)
}
    }
    return allWidgets;
  }

  async getWidgetByName(name) {
    let getWidget = await this.widgetRepository.findOne({where: {widget_name: name}}) 
    if(getWidget.image_path != null) {
      // let splitImagePath = getWidget.image_path.split("/")[2]
      // getWidget.image_path = "http://dev.lmclubclub.com/public/widgets/" + splitImagePath
      getWidget.image_path = await this.FileUploadService.generateCloudFrontUrl(getWidget.image_path)
    }
    return getWidget.id;
  }

  async getWidgetNameById(id) {
    let getWidget = await this.widgetRepository.findOne({where: {id: id}}) 
    if(getWidget.image_path != null) {
      // let splitImagePath = getWidget.image_path.split("/")[2]
      // getWidget.image_path = "http://dev.lmclubclub.com/public/widgets/" + splitImagePath
      getWidget.image_path = await this.FileUploadService.generateCloudFrontUrl(getWidget.image_path)
    }
    return getWidget.widget_name;
  }

  async findWidgetById(id) {
    let getWidget = await this.widgetRepository.findOne({where: {id: id}})
    if(getWidget.image_path != null) {
      // let splitImagePath = getWidget.image_path.split("/")[2]
      // getWidget.image_path = "http://dev.lmclubclub.com/public/widgets/" + splitImagePath
      getWidget.image_path = await this.FileUploadService.generateCloudFrontUrl(getWidget.image_path)
    }
    return getWidget;
  }

  async addWidget(data) {
    let image = data.image_path
    delete data.image_path
    let findWidget = await this.widgetRepository.findOne({where: {widget_name: data.widget_name}})
    if(!findWidget) {
       let saveData = await this.widgetRepository.save(data)
       if(image) {
        let filePath = 'uploads/Widgets/' + saveData.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + image.originalname
        let uploadToS3 = await this.FileUploadService.upload(image,filePath)
        saveData.image_path = filePath
        let updateFilePath = await this.widgetRepository.save(saveData)
    }
       return saveData
    }else {
      return null
    }
  }

  async updateWidget(id,data) {
    data.modified_on = new Date()
    let findWidget = await this.widgetRepository.findOne({where: {id: id}}) 
      for (const key in data) {
       // if (data.hasOwnProperty(key)) {
          if(data[key] === "" || data[key] === null) {
            delete data[key]
          }
        //}
      }
      if(data.widget_name) {
      let result = await this.widgetRepository.findOne({where: {widget_name: data.widget_name,id: Not(id)}})
      
      if(result) {
        return false
      }
      else {

        if(data.file) {
          let filePath = 'uploads/Widgets/' + id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
          let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
          // findWidget.image_path = filePath
          // let updateFilePath = await this.widgetRepository.save(findWidget)
          data['image_path'] = filePath
           delete data.file
      }
        return await this.widgetRepository.update(id,data)
      }
       }
       else {

        if(data.file) {
          let filePath = 'uploads/Widgets/' + id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
          let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
          // findWidget.image_path = filePath
          // let updateFilePath = await this.widgetRepository.save(findWidget)
          data['image_path'] = filePath
           delete data.file
      }
        return await this.widgetRepository.update(id,data)
       }
  }

  async removeWidget(widgetId) {
  let deleteWismap =   await this.SubscriptionWidgetMapRepository
    .createQueryBuilder()
    .delete()
    .from(SubscriptionWidgetMap)
    .where('widget = :widgetId', { widgetId })
    .execute();

    return await this.widgetRepository.delete(widgetId);
  }
 

}
