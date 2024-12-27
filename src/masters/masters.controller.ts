import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CityService } from './city.service';
import { StateService } from './state.service'; 
import { EmailTemplateService } from './emailTemplate.service';
import { SubscriptionService } from './subscription.service'; 
import { WidgetService } from './widget.service';
import { SettingsService } from './settings.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/auth/has-roles.decorator';
import { Role } from 'src/auth/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { updateSubscriptionDto,addWidgetDto,updateWidgetDto,addSettingDto,updateSettingDto,updateEmailTemplateDto,beehiveCategoryDto,pointsMasterDto,contentDto } from './dto/create-master.dto';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { BeehiveCategoryMasterService } from './beehiveCategory.service';
import { RewardPointsMasterService } from "./rewardPoints.service"
import { FileInterceptor } from '@nestjs/platform-express';
import { contentMasterService } from './contentMaster.service';

@ApiTags('Masters')
@Controller('masters')
export class MastersController {
  constructor(
    private readonly CityService: CityService,
    private readonly StateService: StateService,
    private readonly EmailTemplateService: EmailTemplateService,
    private readonly SubscriptionService: SubscriptionService,
    private readonly WidgetService: WidgetService,
    private readonly SettingsService: SettingsService,
    private readonly BeehiveCategoryMasterService: BeehiveCategoryMasterService,
    private readonly RewardPointsMasterService: RewardPointsMasterService,
    private readonly contentMasterService: contentMasterService
    ) {} 

    @Get("/allStates")
    async findAllStates(@Res() response: Response) {
     let AllStates = await this.StateService.findAllStates()
      response.status(200).json({
       status: true,
       message: "All States list",
       data: AllStates
      })
      // return this.StateService.findAllStates();
     }
   
     @Get('/state/:id')
     async findState(@Param('id') id: number,@Res() response: Response) {
       const State = await this.StateService.findStateById(id);
       response.status(200).json({
         status: true,
         message: "State details",
         data: State
        })
       //return State;
     }

  @Get("/allCities")
  @ApiQuery({ name: 'state', required: false, type: Number })
  async findAllCities(@Res() response: Response,@Query('state') state?: number) {
    let filters = {}
    if(state) {
      filters['state'] = state
    }
    let Cities = await this.CityService.findAllCities(filters);
    response.status(200).json({
      status: true,
      message: "All Cities list",
      data: Cities
     })
     //return this.CityService.findAllCities(filters);
   }

   @Get('/city/:id')
  async findCity(@Param('id') id: number,@Res() response: Response) {
    const City = await this.CityService.findCityById(id);
    response.status(200).json({
      status: true,
      message: "City details",
      data: City
     })
    //return City;
  }

//    @Get("/allCategories")
//   async findAllCategories() {
//      return this.CategoryService.findAllCategories();
//    }

//    @Get('/category/:id')
//   async findCategory(@Param('id') id: number) {
//     const Category = await this.CategoryService.findCategoryById(id);
//     return Category;
//   }

   @Get("/allSubscriptions")
   @ApiQuery({ name: 'userType', required: true, type: String })
  async findAllSubscriptions(@Query('userType') userType?: string,) {
    // console.log("userType",userType)
     let allSubscriptions = await this.SubscriptionService.findAllSubscriptions(userType);

     return {status: true,message: "All Subscriptions",data: allSubscriptions}
   }

   @Get('/subscription/:id')
  async findSubscription(@Param('id') id: number) {
    const Subscription = await this.SubscriptionService.findSubscriptionById(id);
    return {status: true,message: "Subscription Details",data: Subscription};
  }

  

  // @Post('/addSubscription') 
  // @ApiBearerAuth('JWT-auth')
  //   @HasRoles(Role.Admin)
  //   @UseGuards(AuthGuard('jwt'), RolesGuard)
  // async addSubscription(@Body() addSubscriptionDto: addSubscriptionDto,@Res() response: Response) { //@UploadedFile() logo,@UploadedFile() file: Express.Multer.File,

  //  let saveData = await this.SubscriptionService.addSubscription(addSubscriptionDto)
  //  if(saveData != null) {
  //    response.status(200).json({
  //     status: true,
  //     message: "New Plan added successfully"
  //    })
  //  }
  //  else {
  //   response.status(400).json({
  //     status: false,
  //     message: "Plan already exists"
  //    })
  //  }
  // }

  @Post('/addSubscription') 
   @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planTitle: {type: 'string'},
        monthlyAmount: {type: 'number'},
       description: {type: 'string'},
       widgets: {type: 'string'},
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  async addSubscription(@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {
    try {
      if(file) {
        req.body.file = file
      }
     let saveData = await this.SubscriptionService.addSubscription(req.body)
     if(saveData) {
       response.status(200).json({
        status: true,
        message: "New Plan added successfully"
       })
     }
     else {
      response.status(400).json({
        status: false,
        message: "Plan name already exists"
       })
     }
    }
    catch(err) {
      response.status(400).json({
        status: false,
        message: err
       })
    }
 
  }

  @Post('/updateSubscription/:id')  
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          planTitle: {type: 'string'},
          monthlyAmount: {type: 'number'},
         description: {type: 'string'},
         widgets: {type: 'string'},
         //is_active: {type: 'boolean'},
          logo: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @UseInterceptors(FileInterceptor('logo'))
  async updateSubscription(@Param('id') id: number,@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {  //@UploadedFile() logo,@UploadedFile() file: Express.Multer.File,
    
    if(file) {
      req.body.file = file
    }
   let saveData = await this.SubscriptionService.updateSubscription(id,req.body)
   if(saveData != null) {
     response.status(200).json({
      status: true,
      message: "Plan updated successfully"
     })
   }
   else {
    response.status(400).json({
      status: false,
      message: "Plan name already exists"
     })
   }
  }

  // @Post('/updateSubscription/:id')  
  // @ApiBearerAuth('JWT-auth')
  //   @HasRoles(Role.Admin)
  //   @UseGuards(AuthGuard('jwt'), RolesGuard)

  // async updateSubscription(@Param('id') id: number,@Body() updateSubscriptionDto: updateSubscriptionDto,@Res() response: Response) {  //@UploadedFile() logo,@UploadedFile() file: Express.Multer.File,
    
  //   if(updateSubscriptionDto.logo) {
  //     updateSubscriptionDto['image_path'] = updateSubscriptionDto.logo
  //     delete updateSubscriptionDto.logo
  //   }
  //  let saveData = await this.SubscriptionService.updateSubscription(id,updateSubscriptionDto)
  //  if(saveData != null) {
  //    response.status(200).json({
  //     status: true,
  //     message: "Plan updated successfully"
  //    })
  //  }
  //  else {
  //   response.status(400).json({
  //     status: false,
  //     message: "Plan already exists"
  //    })
  //  }
  // }

  @Get("/allWidgets")
  async findAllWidgets() {
     return this.WidgetService.findAllWidgets();
   }

   @Get('/widget/:id')
  async findWidget(@Param('id') id: number) {
    const Widget = await this.WidgetService.findWidgetById(id);
    return Widget;
  }

  @Post('/addWidget') 
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          widget_name: {type: 'string'},
         description: {type: 'string'},
          logo: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @UseInterceptors(FileInterceptor('logo'))
  async addWidget(@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {  
  
    if(file) {
      req.body.image_path = file
    }
   let saveData = await this.WidgetService.addWidget(req.body)  
   if(saveData) {
     response.status(200).json({
      status: true,
      message: "New Widget added successfully"
     })
   }
   else {
    response.status(400).json({
      status: false,
      message: "Widget with this name already exists."
     })
   }
  }

  @Post('/updateWidget/:id') 
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard) 
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          widget_name: {type: 'string'},
         description: {type: 'string'},
          logo: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @UseInterceptors(FileInterceptor('logo'))
  async updateWidget(@Param('id') id: number,@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {  //@UploadedFile() logo,@UploadedFile() file: Express.Multer.File,
  
    if(file) {
      req.body.file = file
    }
    
   let saveData = await this.WidgetService.updateWidget(id,req.body)
   
   if(!saveData) {
     response.status(400).json({
      status: false,
      message: "Widget name already exists"
     })
   }
   else {
    response.status(200).json({
      status: true,
      message: "Widget updated successfully"
     })
   }
  }

  @Delete('/deleteWidget/:id')
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
  async DeleteWidget(@Param('id') id: number,@Res() response: Response) {
    let deleteWidget = await this.WidgetService.removeWidget(id)
    if(deleteWidget) {
      response.status(200).json({
        status: true,
        mesage: "Widget Deleted successfully"
      })
    }
  }

  @Get("/allSettings")
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAllSettings() {
     return this.SettingsService.findAllSettings();
   }

   @Get("/customSettings")
  async customSettings() {
     return this.SettingsService.customSettings();
   }
   

   @Get('/setting/:id')
   @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findSetting(@Param('id') id: number) {
    const Setting = await this.SettingsService.findSettingById(id);
    return Setting;
  }

  @Post('/addSetting') 
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
  async addSetting(@Body() addSettingDto: addSettingDto,@Res() response: Response) {  
   let saveData = await this.SettingsService.addSetting(addSettingDto)  
   if(saveData) {
     response.status(200).json({
      status: true,
      message: "New Setting added successfully"
     })
   }
   else {
    response.status(400).json({
      status: false,
      message: "Setting with this flag already exists."
     })
   }
  }

  @Post('/updateSetting/:id') 
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard) 
  async updateSetting(@Param('id') id: number,@Body() updateSettingDto: updateSettingDto,@Res() response: Response) {
 
    let saveData = await this.SettingsService.updateSetting(id,updateSettingDto)
   if(!saveData) {
     response.status(400).json({
      status: false,
      message: "Setting flag already exists"
     })
   }
   else {
    response.status(200).json({
      status: true,
      message: "Setting updated successfully"
     })
   }
  }

  @Get("/broadcastPlans")
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.BusinessUser)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
  async broadcastPlans(@Res() response: Response) {
     let broadcastPlans = await this.SettingsService.broadcastPlans();
     response.status(200).json({
      status: true,
      message: "Broadcast Plans",
      data: broadcastPlans
     })
   }

   @Get("/shareTypes")
   @ApiBearerAuth('JWT-auth')
   @UseGuards(AuthGuard('jwt'))
  async shareTypes(@Res() response: Response) {
     let shareTypes = await this.RewardPointsMasterService.shareTypes();
     response.status(200).json({
      status: true,
      message: "Broadcast Plans",
      data: shareTypes
     })
   }
   
  @Get("/allEmaiTemplates")
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard) 
  async findAllEmailTemplates() {
     return this.EmailTemplateService.findAllEmailTemplates();
   }

   @Get('/emailTemplate/:id')
   @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard) 
  async findEmailTemplate(@Param('id') id: number) {
    const Emailtemplate = await this.EmailTemplateService.findEmailTemplateById(id);
    return Emailtemplate;
  }

  @Post('/createEmailTemplate') 
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard) 
  async createEmailTemplate(@Res() response: Response,@Request() req) {
    let saveData = await this.EmailTemplateService.createEmailTemplate(req.body)
   if(!saveData) {
     response.status(400).json({
      status: false,
      message: "Email template with this name already exists"
     })
   }
   else {
    response.status(200).json({
      status: true,
      message: "Email template created successfully"
     })
   }
  }

  @Post('/updateEmailTemplate/:id') 
  @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard) 
  async updateEmailTemplate(@Param('id') id: number,@Body() updateEmailTemplateDto: updateEmailTemplateDto,@Res() response: Response) {
   
    let saveData = await this.EmailTemplateService.updateEmailTemplate(id,updateEmailTemplateDto)
   if(!saveData) {
     response.status(400).json({
      status: false,
      message: "Email template with this name already exists"
     })
   }
   else {
    response.status(200).json({
      status: true,
      message: "Email template updated successfully"
     })
   }
  }

  @Get("/allBeehiveCategories")
  async findAllBeehiveCategories(@Res() response: Response) {
   let AllBeehiveCategories = await this.BeehiveCategoryMasterService.findAllBeehiveCategory()
    response.status(200).json({
     status: true,
     message: "All BeehiveCategories list",
     data: AllBeehiveCategories
    })
    // return this.StateService.findAllStates();
   }
 
   @Get('/beehiveCategory/:id')
   async findBeehiveCategories(@Param('id') id: number,@Res() response: Response) {
     const BeehiveCategory = await this.BeehiveCategoryMasterService.findBeehiveCategoryById(id);
     response.status(200).json({
       status: true,
       message: "BeehiveCategories details",
       data: BeehiveCategory
      })
   }

   @Get("/allPointsMaster")
  async findAllPointsMaster(@Res() response: Response) {
   let AllPointsMaster = await this.RewardPointsMasterService.findAllPointsMaster();
   AllPointsMaster.map((p: any) => parseInt(p.points));
    response.status(200).json({
     status: true,
     message: "All PointsMaster list",
     data: AllPointsMaster
    })
    // return this.StateService.findAllStates();
   }
 
   @Get('/PointsMaster/:id')
   async findPointsMaster(@Param('id') id: number,@Res() response: Response) {
     const PointsMaster = await this.RewardPointsMasterService.findPointsMasterById(id)
     response.status(200).json({
       status: true,
       message: "PointsMaster details",
       data: PointsMaster
      })
   }
 
   @Post("/updateRewardPoints/:id") 
   @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
   async updateRewardPoints(@Param('id') id: number,@Body() pointsMasterDto: pointsMasterDto,@Res() response: Response) {
try {
  let saveData = await this.RewardPointsMasterService.updatePointsMaster(id,pointsMasterDto)
  if(saveData) {
    response.status(200).json({
      status: true,
      message: "Reward type updated successfully"
     })
  }
  else {
    response.status(400).json({
      status: false,
      message: "Reward type already exists"
     })
  }
}
catch(err) {
  //console.log("err", err)
  response.status(400).json({
    status: false,
    message: err
   })
}
    
   }

   @Post('/addBeehiveCategory') 
   @ApiBearerAuth('JWT-auth')
     @HasRoles(Role.Admin)
     @UseGuards(AuthGuard('jwt'), RolesGuard)
   async addBeehiveCategory(@Body() beehiveCategoryDto: beehiveCategoryDto,@Res() response: Response) {  
    let saveData = await this.BeehiveCategoryMasterService.addBeehiveCategory(beehiveCategoryDto) 
    if(saveData) {
      response.status(200).json({
       status: true,
       message: "New Beehive Category added successfully"
      })
    }
    else {
     response.status(400).json({
       status: false,
       message: "Beehive Category with this name already exists."
      })
    }
   }
 
   @Post('/updateBeehiveCategory/:id') 
   @ApiBearerAuth('JWT-auth')
     @HasRoles(Role.Admin)
     @UseGuards(AuthGuard('jwt'), RolesGuard) 
   async updateBeehiveCategory(@Param('id') id: number,@Body() beehiveCategoryDto: beehiveCategoryDto,@Res() response: Response) {
  
     let saveData = await this.BeehiveCategoryMasterService.updateBeehiveCategory(id,beehiveCategoryDto)
    if(!saveData) {
      response.status(400).json({
       status: false,
       message: "Beehive Category already exists"
      })
    }
    else {
     response.status(200).json({
       status: true,
       message: "Beehive Category updated successfully"
      })
    }
   }

   @Get("/allContnet")
   async findAllContent(@Res() response: Response) {
    let AllContent = await this.contentMasterService.findAllContents()
     response.status(200).json({
      status: true,
      message: "All Content list",
      data: AllContent
     })
     // return this.StateService.findAllStates();
    }
  
    @Get('/content/:id')
    async findContent(@Param('id') id: number,@Res() response: Response) {
      const Content = await this.contentMasterService.findContentById(id)
      response.status(200).json({
        status: true,
        message: "Content details",
        data: Content
       })
      //return State;
    }

    @Post('/updateContent/:id') 
    @ApiBearerAuth('JWT-auth')
      @HasRoles(Role.Admin)
      @UseGuards(AuthGuard('jwt'), RolesGuard) 
    async updateContent(@Param('id') id: number,@Body() contentDto: contentDto,@Res() response: Response) {
   
      let saveData = await this.contentMasterService.updateContent(id,contentDto)
     if(!saveData) {
       response.status(400).json({
        status: false,
        message: "Content name already exists"
       })
     }
     else {
      response.status(200).json({
        status: true,
        message: "Content updated successfully"
       })
     }
    }

//   // @Get("/allSubCategories")
//   // async findAllSubCategories() {
//   //    return this.SubCategoryService.findAllSubCategories();
//   //  }

//   //  @Get("/getSubCategories/:id")
//   // async getSubCategories(@Param('id') id: number) {
//   //    return this.SubCategoryService.getSubCategories(id);
//   //  }

//   //  @Get('/subcategory/:id')
//   // async findSubCategory(@Param('id') id: number) {
//   //   const SubCategory = await this.SubCategoryService.findSubCategoryById(id);
//   //   return SubCategory;
//   // }
  
//   // @Get(':imageName')
//   // async serveImage(@Param('imageName') imageName: string, @Res() res: Response) {
//   //   const imagePath = "http://dev.lmclubclub.com/plans/" + imageName  //join(__dirname, '..', 'public', imageName);

//   //   // Add error handling
//   //   try {
//   //     // Check if the file exists
//   //     console.log("imag",imagePath)
//   //     // if (!existsSync(imagePath)) {
//   //     //   res.status(404).send('Not Found');
//   //     //   return;
//   //     // }

//   //     // Send the file
//   //     res.sendFile(imagePath, { root: '/' });
//   //   } catch (error) {
//   //     // Handle other errors
//   //     console.error(error);
//   //     res.status(500).send('Internal Server Error');
//   //   }
//   // }

}
