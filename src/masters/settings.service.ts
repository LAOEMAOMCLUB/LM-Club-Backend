import { Injectable } from '@nestjs/common';
import { Not, Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Settings } from './../models/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private SettingsRepository: Repository<Settings>,
  ) {}

  async findAllSettings() {
    let allSettings = await this.SettingsRepository.find({order: {
      modified_on: 'DESC', 
    }})
    return allSettings;
  }

  async customSettings() {
    const ids = [7, 8]; 
    const entities = await this.SettingsRepository
        .createQueryBuilder("settings")
        .where("settings.id IN (:...ids)", { ids }) // Using IN operator with parameter binding
        .getMany();

    return entities;
  }

  async findSettingById(id) {
    let getSetting = await this.SettingsRepository.findOne({where: {id: id}})
    return getSetting;
  }

  async broadcastPlans() {
    let flagname = "Broadcast Plan"
    return await this.SettingsRepository.createQueryBuilder("settings")
    .where("settings.flag ILIKE :flagname", { flagname: `%${flagname}%` })
    .getMany();
  }

  async addSetting(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if(data[key] == "" || data[key] == null) {
          delete data[key]
        }
      }
    }
    let findExistingSetting = await this.SettingsRepository.findOne({where: {flag: data.flag}})
    if(findExistingSetting) {
       return null
    }
    else {
      let saveSetting = await this.SettingsRepository.save(data)
      return saveSetting
    }
  }

  async updateSetting(id,data) {
    data.modified_on = new Date()
    //console.log("dataOne---", data)
    let findSetting = await this.SettingsRepository.findOne({where: {id: id}})

     if(data.flag) {
       let findExistingsetting = await this.SettingsRepository.findOne({where: {flag: data.flag,id: Not(id)}})
       if(findExistingsetting) {
          return null
       }
       else {
          // if(data.activeStatus == false) {
          //   data.is_active = false
          // }
          // else {
          //   data.is_active = true
          // }
          // delete data.activeStatus
         let saveData = await this.SettingsRepository.update(id, data)
         return saveData
       }
     }
     else {
       // console.log("activeSarus---")
        // if(data.activeStatus == false) {
        //   data.is_active = false
        // }
        // else {
        //   data.is_active = true
        // }
        // delete data.activeStatus
      let saveData = await this.SettingsRepository.update(id, data)
      return saveData
     }
  }
}


// @Post('/addSubscription') 
// // @ApiBearerAuth('JWT-auth')
// //   @HasRoles(Role.Admin)
// //   @UseGuards(AuthGuard('jwt'), RolesGuard)
// @ApiConsumes('multipart/form-data')
// @ApiBody({
//   schema: {
//     type: 'object',
//     properties: {
//     //   planTitle: {type: 'string'},
//     //   monthlyAmount: {type: 'number'},
//     //  description: {type: 'string'},
//     //  widgets: {type: 'string'},
//       logo: {
//         type: 'string',
//         format: 'binary',
//       },
//     },
//   },
// })
// @UseInterceptors(FileInterceptor('logo'))
// // @UseInterceptors(FileInterceptor('logo',
// // {
// //   storage:diskStorage({
// //     destination:"./public/plans/",
// //     filename: editFileName
// //   })
// // }
// // ))
// async addSubscription(@UploadedFile() logo,@Body() addSubscriptionDto: addSubscriptionDto,@Res() response: Response) { //@UploadedFile() logo,@UploadedFile() file: Express.Multer.File,
//   console.log("logo---", logo)
//   // if(file) {
//   //   addSubscriptionDto['image_path'] = file.originalname
//   // }
//   // if(logo) {
//   //   addSubscriptionDto['image_path'] = logo.path
//   // }
//   console.log("logo.path",logo.path)

//   let path = 'uploads/' + logo.fieldname + '/' + logo.originalname
//   let saveFile = await this.FileUploadService.generateAcceleratedUrl(path)
//   if(saveFile) {
//     console.log("file--", saveFile)
//     // try {
//     //   const response = await axios.put(saveFile, logo.buffer, {
//     //     headers: {
//     //       'Content-Type': 'application/octet-stream', // Set the appropriate content type
//     //     },
//     //   });

//     //   if (response.status === 200) {
//     //     console.log('File uploaded successfully.');
//     //   } else {
//     //     console.error('Failed to upload file.');
//     //   }
//     // } catch (error) {
//     //   console.error('Error uploading file:', error);
//     // }
//   }
//   //addSubscriptionDto['image_path'] = 'uploads/' + logo.fieldname + '/' + logo.originalname
// //  let saveData = await this.SubscriptionService.addSubscription(addSubscriptionDto)
// //  if(saveData != null) {
// //    response.status(200).json({
// //     status: true,
// //     message: "New Plan added successfully"
// //    })
// //  }
// //  else {
// //   response.status(400).json({
// //     status: false,
// //     message: "Plan already exists"
// //    })
// //  }
// }