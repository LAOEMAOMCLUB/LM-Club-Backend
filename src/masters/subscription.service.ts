import { Injectable } from '@nestjs/common';
import { Equal, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionType } from '../models/subscriptionType.entity';
import { SubscriptionWidgetMap } from '../models/subscriptionWidgetMap.entity';
import { Settings } from 'src/models';
import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from "./../middleware/middleware.service"
import { contentMasterService } from './contentMaster.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionType)
    private subscriptionRepository: Repository<SubscriptionType>,

    @InjectRepository(SubscriptionWidgetMap)
    private SubscriptionWidgetMapRepository: Repository<SubscriptionWidgetMap>,

    @InjectRepository(Settings)
    private SettingsRepository: Repository<Settings>,

    private readonly FileUploadService: FileUploadService,
    private readonly MiddlewareService: MiddlewareService,
    private readonly contentMasterService: contentMasterService
  ) {}

  async findAllSubscriptions(userType) {
    let allSubscriptions
    if(userType === "mobile") {
      allSubscriptions = await this.subscriptionRepository.find({order: {
        created_on: 'ASC', 
      }})
    }
    else {
      allSubscriptions = await this.subscriptionRepository.find({order: {
        modified_on: 'DESC', 
      }})
    }
    
    let renewRegistrationAmount = await this.SettingsRepository.findOne({where: {flag: "Registration/Renewal",is_active: true}})
    for(let i = 0; i < allSubscriptions.length; i ++) {
    //       if(allSubscriptions[i].image_path != null) {
    //   let splitImagePath = allSubscriptions[i].image_path.split("/")[2]
    //   allSubscriptions[i].image_path = "http://dev.lmclubclub.com/public/plans/" + splitImagePath
    // }

    allSubscriptions[i].image_path = await this.FileUploadService.generateCloudFrontUrl(allSubscriptions[i].image_path)

      allSubscriptions[i].plan_amount = +allSubscriptions[i].plan_amount
      allSubscriptions[i]['planAmount'] = '$' + allSubscriptions[i].plan_amount
      allSubscriptions[i]['renewalRegistrationAmount'] = renewRegistrationAmount.key
      let widArr = []
      let widgets = await this.SubscriptionWidgetMapRepository.find({where: {subscriptionType: Equal(allSubscriptions[i].id),is_active: true},relations:["widget"]})
      
      for(let w = 0; w < widgets.length; w ++) {
        if(widgets[w].widget.is_active == true) {
        let widget = {
          id: widgets[w].widget.id,
          widget_name: widgets[w].widget.widget_name,
          description: widgets[w].widget.description
        }
        widArr.push(widget)
      }
      }
      allSubscriptions[i]['widgets'] = widArr
    }
    return allSubscriptions;
  }

  async findSubscriptionById(id) {
    let getSubscription = await this.subscriptionRepository.findOne({where: {id: id}})
    let renewRegistrationAmount = await this.SettingsRepository.findOne({where: {flag: "Registration/Renewal",is_active: true}})
    let getWidgets = await this.SubscriptionWidgetMapRepository.find({where: {subscriptionType: Equal(id),is_active: true},relations:["widget"]})
  let widgetsArr = []
  getSubscription.plan_amount = +getSubscription.plan_amount
  getSubscription['planAmount'] = '$' + getSubscription.plan_amount
  getSubscription['renewalRegistrationAmount'] = renewRegistrationAmount.key
  if(getSubscription.image_path != null) {
    // let splitImagePath = getSubscription.image_path.split("/")[2]
    // //getSubscription.image_path = "http://localhost:5000/plans/" + splitImagePath
    //  getSubscription.image_path = "http://dev.lmclubclub.com/public/plans/" + splitImagePath
    getSubscription.image_path = await this.FileUploadService.generateCloudFrontUrl(getSubscription.image_path)
  }
  
  for(let i = 0; i < getWidgets.length; i ++) {
    if(getWidgets[i].widget.is_active == true) {
    let widbject = {
      id: getWidgets[i].widget.id,
      widget_name: getWidgets[i].widget.widget_name,
      description: getWidgets[i].widget.description
    }
    widgetsArr.push(widbject)
  }
  }
  getSubscription['widgets'] = widgetsArr
  getSubscription["T&C"] = await this.contentMasterService.getContentByName("Terms of use and Privacy policy (LM Club)")
    return getSubscription;
  }

  async addSubscription(data) {
    let findExistingPlan = await this.subscriptionRepository.findOne({where: {plan: data.planTitle.toUpperCase()}})
    if(findExistingPlan) {
      return null
    }
    else {
      let widgets;
      let saveData = {
        plan: data.planTitle.toUpperCase(),
        plan_amount: data.monthlyAmount,
        //description: data.description,
        //image_path: data.logo
      }

      // if(data.image_path) {
      //   saveData['image_path'] = data.image_path
      // }

      if(data.description) {
        saveData['description'] = data.description
      }
      
      let addPlan = await this.subscriptionRepository.save(saveData)

      if(data.file) {
        let filePath = 'uploads/plan/' + addPlan.id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
        let uploadToS3 = await this.FileUploadService.upload(data.file,filePath)
        addPlan.image_path = filePath
        let updateFilePath = await this.subscriptionRepository.save(addPlan)
        //console.log("uploadFile---",uploadFile)
    }

      if(data.widgets != null && data.widgets != '')  {
        widgets = data.widgets.split(",")
        for(let i = 0; i < widgets.length; i ++) {
          let mapData = {
            subscriptionType : {id: addPlan.id},
            widget: {id: widgets[i]}
          }
           let mapSubWidget = await this.SubscriptionWidgetMapRepository.save(mapData)
        }
     }
      return addPlan
    }
    
  }

  // async updateSubscription(id,data) {
  //   let findSubscription = await this.subscriptionRepository.findOne({where: {id: id}})
  //   //console.log("data--", data)
  //   if(data.planTitle) {
  //     let findExistingSubscription = await this.subscriptionRepository.findOne({where: {plan: data.planTitle,id: Not(id)}})
  //     if(findExistingSubscription) {
  //        return null
  //     }
  //     else {
  //   //if(findSubscription) {
  //     // for (const key in data) {
  //     //   if (data.hasOwnProperty(key)) {
  //     //     if(data[key] == "" || data[key] == null) {
  //     //       delete data[key]
  //     //     }
  //     //   }
  //     // }
  //     if(data.planTitle) {
  //       data['plan'] = data.planTitle
  //       delete data.planTitle
  //     }
  //     if(data.monthlyAmount) {
  //       data['plan_amount'] = data.monthlyAmount
  //       delete data.monthlyAmount
  //     }
  //     //if(data.activeStatus) {
  //       // if(data.is_active == false) {
  //       //   findSubscription.is_active = false
  //       //   await this.subscriptionRepository.save(findSubscription)
  //       //   delete data.activeStatus
  //       // }
  //       // else {
  //       //   findSubscription.is_active = true
  //       //   await this.subscriptionRepository.save(findSubscription)
  //       //   delete data.activeStatus
  //       // }
        
  //     //}
  //     if(data.addWidgets == "" || !data.addWidgets) {
  //      // console.log("addWidgets----")
        
  //       delete data.addWidgets
  //     }
  //     else {
  //       let splitWidgets = data.addWidgets.split(",")

  //       for(let aw = 0; aw < splitWidgets.length; aw ++) {
  //         let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[aw])}}})
  //         if(!findWidget) {
  //           let saveNewWidget = {
  //             subscriptionType: id,
  //             widget: {id: Number(splitWidgets[aw])}
  //           }
  //           let addWidget = await this.SubscriptionWidgetMapRepository.save(saveNewWidget)
  //         }
  //         else {
  //           if(findWidget.is_active == false) {
  //             findWidget.is_active = true
  //             let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget)
  //           }
  //         }
          
  //       }
  //       delete data.addWidgets
  //     }
  //       if(data.removeWidgets == ""|| !data.removeWidgets) {
  //         //console.log("removeWidgets----")
  //         delete data.removeWidgets
  //       }
  //       else {
  //         let splitWidgets = data.removeWidgets.split(",")

  //         for(let dw = 0; dw < splitWidgets.length; dw ++) {
  //            let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[dw])},is_active: true}})
  //            if(findWidget) {
  //             findWidget.is_active = false
  //             let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget) 
  //            }
  //         }
  //         delete data.removeWidgets
  //       }
  //     //console.log("data", data)
  //     return  await this.subscriptionRepository.update(id,data)
  //     }
  //   }
  //   else {
  //     //if(findSubscription) {
  //       // for (const key in data) {
  //       //   if (data.hasOwnProperty(key)) {
  //       //     if(data[key] == "" || data[key] == null) {
  //       //       delete data[key]
  //       //     }
  //       //   }
  //       // }
  //       // if(data.planTitle) {
  //       //   data['plan'] = data.planTitle
  //       //   delete data.planTitle
  //       // }
  //       if(data.monthlyAmount) {
  //         data['plan_amount'] = data.monthlyAmount
  //         delete data.monthlyAmount
  //       }
  //       // if(data.activeStatus) {
  //       //   if(data.activeStatus == 'false') {
  //       //     findSubscription.is_active = false
  //       //     await this.subscriptionRepository.save(findSubscription)
  //       //   }
  //       //   else {
  //       //     findSubscription.is_active = true
  //       //     await this.subscriptionRepository.save(findSubscription)
  //       //   }
  //       //   delete data.activeStatus
  //       // }
  //       if(data.addWidgets == "" || !data.addWidgets) {
  //        // console.log("addWidgets----")
  //        delete data.addWidgets
  //       }
  //       else {
  //         let splitWidgets = data.addWidgets.split(",")
  
  //         for(let aw = 0; aw < splitWidgets.length; aw ++) {
  //           let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[aw])}}})
  //           if(!findWidget) {
  //             let saveNewWidget = {
  //               subscriptionType: id,
  //               widget: {id: Number(splitWidgets[aw])}
  //             }
  //             let addWidget = await this.SubscriptionWidgetMapRepository.save(saveNewWidget)
  //           }
  //           else {
  //             if(findWidget.is_active == false) {
  //               findWidget.is_active = true
  //               let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget)
  //             }
  //           }
            
  //         }
  //         delete data.addWidgets
  //       }
  //         if(data.removeWidgets == "" || !data.removeWidgets) {
  //           //console.log("removeWidgets----")
  //           delete data.removeWidgets
  //         }
  //         else {
  //           let splitWidgets = data.removeWidgets.split(",")
  
  //           for(let dw = 0; dw < splitWidgets.length; dw ++) {
  //              let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[dw])},is_active: true}})
  //              if(findWidget) {
  //               findWidget.is_active = false
  //               let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget) 
  //              }
  //           }
  //           delete data.removeWidgets
  //         }
  //       //console.log("data", data)
  //       return  await this.subscriptionRepository.update(id,data)
  //   }
    

  //   //}
  //   // else {
  //   //   return null
  //   // }
  // }

  

  async updateSubscription(id,data) {
    data.modified_on = new Date()
    for (const key in data) {
          // if (data.hasOwnProperty(key)) {
            if(data[key] === "" || data[key] === null) {
              delete data[key]
           // }
          }
        }
        
    let findSubscription = await this.subscriptionRepository.findOne({where: {id: id}})
    if(data.planTitle) {
      let findExistingSubscription = await this.subscriptionRepository.findOne({where: {plan: data.planTitle.toUpperCase(),id: Not(id)}})
      if(findExistingSubscription) {
         return null
      }
      else {
      if(data.planTitle) {
        data['plan'] = data.planTitle.toUpperCase()
        delete data.planTitle
      }
      if(data.monthlyAmount) {
        data['plan_amount'] = data.monthlyAmount
        delete data.monthlyAmount
      }
      if(data.addWidgets == "" || !data.addWidgets) {
       // console.log("addWidgets----")
        
        delete data.addWidgets
      }
      else {
        let splitWidgets = data.addWidgets.split(",")

        for(let aw = 0; aw < splitWidgets.length; aw ++) {
          let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[aw])}}})
          if(!findWidget) {
            let saveNewWidget = {
              subscriptionType: id,
              widget: {id: Number(splitWidgets[aw])}
            }
            let addWidget = await this.SubscriptionWidgetMapRepository.save(saveNewWidget)
          }
          else {
            if(findWidget.is_active == false) {
              findWidget.is_active = true
              let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget)
            }
          }
          
        }
        delete data.addWidgets
      }
        if(data.removeWidgets == ""|| !data.removeWidgets) {
          //console.log("removeWidgets----")
          delete data.removeWidgets
        }
        else {
          let splitWidgets = data.removeWidgets.split(",")

          for(let dw = 0; dw < splitWidgets.length; dw ++) {
             let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[dw])},is_active: true}})
             if(findWidget) {
              findWidget.is_active = false
              let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget) 
             }
          }
          delete data.removeWidgets
        }

        if(data.file) {
          let filePath = 'uploads/plan/' + id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
          let deleteImage = await this.FileUploadService.deleteImageFromS3(findSubscription.image_path)
          let uploadImage = await this.FileUploadService.upload(data.file,filePath)
          data['image_path'] = filePath
          delete data.file
        }
      console.log("data",data)
      return  await this.subscriptionRepository.update(id,data)
      }
    }
    else {
        if(data.planTitle) {
          data['plan'] = data.planTitle.toUpperCase()
          delete data.planTitle
        }
        if(data.monthlyAmount) {
          data['plan_amount'] = data.monthlyAmount
          delete data.monthlyAmount
        }
    
        if(data.addWidgets == "" || !data.addWidgets) {
         delete data.addWidgets
        }
        else {
          let splitWidgets = data.addWidgets.split(",")
  
          for(let aw = 0; aw < splitWidgets.length; aw ++) {
            let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[aw])}}})
            if(!findWidget) {
              let saveNewWidget = {
                subscriptionType: id,
                widget: {id: Number(splitWidgets[aw])}
              }
              let addWidget = await this.SubscriptionWidgetMapRepository.save(saveNewWidget)
            }
            else {
              if(findWidget.is_active == false) {
                findWidget.is_active = true
                let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget)
              }
            }
            
          }
          delete data.addWidgets
        }
          if(data.removeWidgets == "" || !data.removeWidgets) {
            //console.log("removeWidgets----")
            delete data.removeWidgets
          }
          else {
            let splitWidgets = data.removeWidgets.split(",")
  
            for(let dw = 0; dw < splitWidgets.length; dw ++) {
               let findWidget = await this.SubscriptionWidgetMapRepository.findOne({where: {subscriptionType: {id: id},widget: {id: Number(splitWidgets[dw])},is_active: true}})
               if(findWidget) {
                findWidget.is_active = false
                let updateWidget = await this.SubscriptionWidgetMapRepository.save(findWidget) 
               }
            }
            delete data.removeWidgets
          }

          if(data.file) {
            let filePath = 'uploads/plan/' + id + '/' + this.MiddlewareService.unixTimestampSeconds() + '-' + data.file.originalname
            let deleteImage = await this.FileUploadService.deleteImageFromS3(findSubscription.image_path)
            let uploadImage = await this.FileUploadService.upload(data.file,filePath)
            data['image_path'] = filePath
            delete data.file
          }
        return  await this.subscriptionRepository.update(id,data)
    }
  }
}
