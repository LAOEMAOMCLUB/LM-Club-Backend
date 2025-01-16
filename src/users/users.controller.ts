import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Param,
  Req,
  Res,
  Headers,
  Put,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateUserDto,
  UserSubcriptionDto,
  UserWidgetDto,
  UserOtpDto,
  forgotPasswordDto,
  resetPasswordDto,
  gAUrlDto,
  UpdateProfileDto,
  changePasswordDto
} from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from './users.service';
import { UserDetail } from '.././models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { UserSubscriptionService } from './userSubscription.service';
//import { UserWidgetService } from "./userWidget.service"
import { MiddlewareService } from '../middleware/middleware.service';
import { UserVerificationService } from './userVerification.service';
import { MailService } from 'src/email/email.service';
import { SmsService } from "../sms/sms.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/middleware/s3.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from 'src/payment/payment.service';
import { UserSubscription } from 'src/models';
import { UserReferral } from 'src/models'; 
import { ReferralRewardTransaction } from "src/models";
import { RewardPointsMaster } from 'src/models';
import { BusinessUserDetailService } from "./userBusiness.service";
import { UserCardService } from "./userCards.service"
import { BusinessUserDetail } from 'src/models';
import { WidgetService } from "src/masters/widget.service"
//import { logResponse } from './../../logging.interceptor';
import { contentMasterService } from 'src/masters/contentMaster.service';
import { Settings } from 'src/models';
import { NotificationService } from "./../notification/notification.service"


import { HasRoles } from '../auth/has-roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('user')
@Controller('user')
//@ApiBearerAuth()
//@UseInterceptors(LoggingInterceptor)
export class UsersController {
  constructor(
    @InjectRepository(UserDetail)
    private userRepository: Repository<UserDetail>,

    @InjectRepository(UserSubscription)
    private UserSubscriptionRepository: Repository<UserSubscription>,

    @InjectRepository(UserReferral)
    private UserReferralRepository: Repository<UserReferral>,

    @InjectRepository(ReferralRewardTransaction)
    private ReferralRewardTransactionRepository: Repository<ReferralRewardTransaction>,

    @InjectRepository(RewardPointsMaster)
    private RewardPointsMasterRepository: Repository<RewardPointsMaster>,

    @InjectRepository(BusinessUserDetail)
    private BusinessUserDetailRepository: Repository<BusinessUserDetail>,

    @InjectRepository(Settings)
    private SettingsRepository: Repository<Settings>,
    
    
    private readonly usersService: UsersService,
    private readonly UserSubscriptionService: UserSubscriptionService,
    private readonly MiddlewareService: MiddlewareService,
    private readonly UserVerificationService: UserVerificationService,
    private readonly EmailService: MailService,
    private readonly SmsService: SmsService,
    private readonly FileUploadService: FileUploadService,
    private readonly AuthService: AuthService,
    private readonly BusinessUserDetailService: BusinessUserDetailService,
    private readonly UserCardService: UserCardService,
    private readonly WidgetService: WidgetService,
    private readonly contentMasterService: contentMasterService,
    private readonly NotificationService: NotificationService,
    private readonly PaymentService: PaymentService
  ) //private readonly UserWidgetService: UserWidgetService
  {}


  private async generateAndSendOTP(newUser: any,type: String) {
    const randomNumber = this.MiddlewareService.generateFourDigitRandomNumber();
    let otpData
    if(type === "createOtp") {
       otpData = {
        mobile_number: newUser.mobile_number,
        verification_code: randomNumber,
        created_by: newUser.id,
        modified_by: newUser.id,
        user: newUser.id
      };
      await this.UserVerificationService.addOtp(otpData);
    }
    else {
      otpData = {
        verification_code: randomNumber,
        id: newUser.id,
      };
      await this.UserVerificationService.updateOtp(otpData);
      
    }
    
    const mailData = {
      name: newUser.user_name,
      otp: randomNumber,
      email: newUser.email_id
    };
    await this.EmailService.sendMail(mailData, 'otp');
    await this.SmsService.sendOTP(randomNumber,this.MiddlewareService.cleanAndConcatenate(newUser.mobile_number));
  }

  private sendResponseTypewithUserData(response: Response, status: boolean, statusCode: number, message: string, data: any,accessToken: any) {
    if(!accessToken) {
      return response.status(statusCode).json({
        status: status,
        message: message,
        data: data
      });
    }
    else {
      return response.status(statusCode).json({
        status: status,
        message: message,
        data: data,
        accessToken: accessToken
      });
    }
    
  }
  
  private sendResponsewithMessage(response: Response, status: boolean, statusCode: number, message: string, mobile: any) {
    //console.log("mobile", mobile)
    if(mobile && typeof mobile === "object") {
      //console.log("obj",mobile)
      return response.status(statusCode).json({
        status: status,
        message: message,
        accessToken: mobile.access_token
      });
    }
    else if(mobile && typeof mobile === "string") {
     // console.log("string")
      return response.status(statusCode).json({
        status: status,
        message: message,
        mobile: mobile
      });
    }
    else {
     // console.log("-----")
      return response.status(statusCode).json({
        status: status,
        message: message
      });
    }
   
  }

  @Post('/signup')
  @ApiOperation({
    summary: 'Sign Up as a user',
  })
  @ApiHeader({
    name: 'deviceType',
    description: 'Your device type',
    required: true,
  })
  @UsePipes(ValidationPipe)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
    @Headers() headers: any,
  ) {
    try {
      const checkRole = await this.usersService.checkRole(createUserDto.email, createUserDto.mobile, createUserDto.username, 1);
    if (checkRole === "email" || checkRole === "mobile" || checkRole === "username") {
      return this.MiddlewareService.sendResponsewithMessage(response, false, 400, `This ${checkRole} is already in use`,null);
    }
    
        createUserDto['role_id'] = null;
        if (headers) {
          if (headers.devicetype === 'mobile') {
            createUserDto['role_id'] = 1;
          }
        }
        let UserExists = await this.usersService.findUser(createUserDto.email);
        if (UserExists) {
          delete UserExists.password
          let findUserSubscriptionDetails = await this.UserSubscriptionRepository.findOne({where: {user: {id:UserExists.id}},relations: ['subscription']})
         
          if (!UserExists.is_verified_user) {
            UserExists['userSubscriptionId'] = findUserSubscriptionDetails.id
            UserExists['userPlan'] = findUserSubscriptionDetails.subscription

            await this.generateAndSendOTP(UserExists,"updateOtp")

            return this.MiddlewareService.sendResponseTypewithUserData(response,false, 200, 'You have enrolled but verification is not done.', UserExists,null);
          } 
          else if (UserExists.is_verified_user && !findUserSubscriptionDetails.is_active) {
            UserExists['planDetails'] = findUserSubscriptionDetails
            return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'You have enrolled but subscription payment is not done.', UserExists,null);
          } 
          else {
            return this.MiddlewareService.sendResponseTypewithUserData(response,false, 400, 'User with this email already exists', UserExists,null);
          }
        } else {
          let mobileExists = await this.usersService.findMobile(
            createUserDto.mobile,
          );
          let userNameExists = await this.usersService.findUsername(
            createUserDto.username,
          );

          if(mobileExists || userNameExists) {
            let message ;
            if (mobileExists) {
              message = 'Mobile number already exists'
            }
            else {
              message = 'User name already exists'
            }
            
            return this.MiddlewareService.sendResponsewithMessage(response,false, 400, message,null);
          } 
            let UserCreation = await this.usersService.create(createUserDto);
            if (UserCreation) {
              let UserExists = await this.usersService.findUser(UserCreation.email_id);
              await this.generateAndSendOTP(UserCreation,"createOtp")
              
              delete UserExists.password;

              let getUserSubscriptionDetails = await this.UserSubscriptionRepository.findOne({where: {user: {id:UserCreation.id}},relations: ["subscription"]})
              UserExists["plan"] = getUserSubscriptionDetails.subscription.plan
              UserExists["planAmount"] = getUserSubscriptionDetails.subscription.plan_amount
              return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'User signed up successfully', UserExists,null);
            }
        }
      
    }
    catch(err) {
      //console.log("err", err)
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, err,null);
    }
    
  }


  @Post('/signupnew')
  @ApiOperation({
    summary: 'Sign Up as a user',
  })
  @ApiHeader({
    name: 'deviceType',
    description: 'Your device type',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User signed up successfully' })
  @ApiResponse({
    status: 400,
    description: 'You have enrolled but verification is not done.',
  })
  @ApiResponse({
    status: 400,
    description: 'User already exists with this email.',
  })
  @UsePipes(ValidationPipe)
  async createNew(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
    @Headers() headers: any,
  ) {
    createUserDto['role_id'] = null;
    if (headers) {
      if (headers.devicetype == 'mobile') {
        createUserDto['role_id'] = 1;
      }
    }

    let findUser = await this.userRepository.findOne({where: {user_name: createUserDto.username,mobile_number: createUserDto.mobile,email_id: createUserDto.email}})
    if(findUser) {

      delete findUser.password
      let findUserSubscription = await this.UserSubscriptionRepository.findOne({where: {user: {id:findUser.id}},relations: ['subscription']}) 
        if(findUser.is_verified_user == false) {

          findUser['userSubscriptionId'] = findUserSubscription.id
          findUser['userPlan'] = findUserSubscription.subscription

        const randomNumber =
        this.MiddlewareService.generateFourDigitRandomNumber();

      let OtpData = {
        verification_code: randomNumber,
        id: findUser.id,
      };
      let mailData = {
        name: findUser.user_name,
        otp: randomNumber,
        email: findUser.email_id,
      };
      let sendMail = await this.EmailService.sendMail(mailData,'otp');
      //let sendOtp = await this.SmsService.sendOTP(randomNumber,findMobile.mobile_number);
      let generateUserOtp =
        await this.UserVerificationService.updateOtp(OtpData);
        return response
          .status(200)
          .json({
            status: true,
            message: 'Your account is pending with verification, please verify your account',
            data: findUser
          });
        }
        else if(findUserSubscription.is_active == false) {
          findUser['planDetails'] = findUserSubscription
        return response
          .status(200)
          .json({
            status: true,
            message: 'Your account is pending with payment, please make payment to proceed furthur.',
            data: findUser,
          });
        }
        else {
          response.status(400).json({
            status: false,
            message: "User already exists."
          })
        }
    }
  else {
    let checkEmailMobile = await this.userRepository.findOne({where: {email_id: createUserDto.email,mobile_number: createUserDto.mobile}})
    let checkEmailUserName = await this.userRepository.findOne({where: {email_id: createUserDto.email,user_name: createUserDto.username}})
    let checkMobileUserName = await this.userRepository.findOne({where: {mobile_number: createUserDto.mobile,user_name: createUserDto.username}})
    let existingUsername = await this.userRepository.findOne({where: {user_name: createUserDto.username}})
    let existingMobile = await this.userRepository.findOne({where: {mobile_number: createUserDto.mobile}})
    let existingEmail = await this.userRepository.findOne({where: {email_id: createUserDto.email}})

    if(checkEmailMobile) {
       response.status(200).json({
        status: false,
        message: "Mobile number & Email already exists"
       })
    }
    else if(checkEmailUserName) {
      response.status(200).json({
        status: false,
        message: "Username & Email already exists"
       })
    }
    else if(checkMobileUserName) {
      response.status(200).json({
        status: false,
        message: "Username & Mobile number already exists"
       })
    }
    else if(existingUsername) {
      response.status(200).json({
        status: false,
        message: "Username already exists"
       })
    }
    else if(existingMobile) {
      response.status(200).json({
        status: false,
        message: "Mobile number already exists"
       })
    }
    else if(existingEmail) {
      response.status(200).json({
        status: false,
        message: "Email already exists"
       })
    }
    else {
      let UserCreation = await this.usersService.create(createUserDto);
      if (UserCreation) {
        const randomNumber =
          this.MiddlewareService.generateFourDigitRandomNumber();
        let OtpData = {
          mobile_number: UserCreation.mobile_number,
          verification_code: randomNumber,
          created_by: UserCreation.id,
          modified_by: UserCreation.id,
          user: UserCreation.id,
        };
        let mailData = {
          name: UserCreation.user_name,
          otp: randomNumber,
          email: UserCreation.email_id,
        };

        let generateUserOtp =
          await this.UserVerificationService.addOtp(OtpData);
        let sendMail = await this.EmailService.sendMail(mailData,'otp');

        //let sendOtp = await this.SmsService.sendOTP(randomNumber,UserCreation.mobile_number);

        delete UserCreation.password;
        return response
          .status(200)
          .json({
            status: true,
            message: 'User signed up successfully',
            data: UserCreation
          }); 
      }
    }
  }
  }

  @Post('/verifyOtp')
  async verifyotp(@Body() UserOtpDto: UserOtpDto, @Res() response: Response) {
   try { 
    let checkOtp
    let checkUserVerified 
    let checkFreeSubscription
    let accessToken
     if(!UserOtpDto.email) {
      checkUserVerified = await this.userRepository.findOne({where: {mobile_number: UserOtpDto.mobile,is_verified_user: false,role: {id: 4}},relations: ["role"]})
      checkOtp = await this.UserVerificationService.verifyotp(UserOtpDto);
      let findUserId = await this.userRepository.findOne({where: {mobile_number: UserOtpDto.mobile}}) //,role: {id: In ([1,5])
      checkFreeSubscription = await this.UserSubscriptionRepository.findOne({where: {user: {id: findUserId.id},subscription: {id: 5},is_active: false},relations: ['user','subscription']})
      if(checkFreeSubscription) {
        accessToken = await this.AuthService.login(checkFreeSubscription.user.email_id);
      }
    }
    else {
      let findUser = await this.userRepository.findOne({where: {email_id: UserOtpDto.email}})
      UserOtpDto['id'] = findUser.id
      checkOtp = await this.UserVerificationService.verifyotp(UserOtpDto);
    }

    if (checkOtp) {
      if(UserOtpDto.mobile) {
        let makeUserVerified =
        await this.usersService.makeUserVerified(UserOtpDto);

        if(UserOtpDto.planId && UserOtpDto.userSubscriptionId) {
          let updateUserPlan = await this.UserSubscriptionRepository.update(UserOtpDto.userSubscriptionId,{subscription: {id: UserOtpDto.planId}})
        }

        if(checkUserVerified) {
          let data = {
            name: checkUserVerified.user_name,
            email: checkUserVerified.email_id,
            //subject: "test"
          }
          await this.EmailService.sendMail(data,"Welcome")
        }
        if(checkFreeSubscription) {
          
          let subscriptionData = {
            subscription_from : await this.MiddlewareService.getEasternTime(),
            subscription_upto : await this.MiddlewareService.getFreeSubscriptionExpireDate(),
            is_active : true
          }
          let updateUserSubscription = await this.UserSubscriptionRepository.update(checkFreeSubscription.id,subscriptionData)
          accessToken =  await this.AuthService.login(checkFreeSubscription.user.email_id);
          await this.PaymentService.freePlanSubscription(checkFreeSubscription)
        }
      }
      return this.MiddlewareService.sendResponsewithMessage(response,true, 200, 'Otp verified Successfully',accessToken);
    } else {
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, 'Please recheck your otp',null);
    }
  }
  catch(err) {
    //console.log("err", err)
    return this.MiddlewareService.sendResponsewithMessage(response,false, 400, err,null);
    response.status(400).json({
      status: false,
      message: err
    })
  }
  }

  @Post('/resendOtp')
  async resendOtp(
    @Body() forgotPasswordDto: forgotPasswordDto,
    @Res() response: Response,
  ) {
    let findMobile
     
    if(!forgotPasswordDto.email) {
      findMobile = await this.usersService.forgotPassword(
        forgotPasswordDto.mobile,
      );
    }
    else {
      findMobile = await this.userRepository.findOne({where: {email_id: forgotPasswordDto.email},relations: ['role']})
    }
    if (findMobile) {
      await this.generateAndSendOTP(findMobile,"updateOtp")
      return this.MiddlewareService.sendResponsewithMessage(response,true, 200, 'An OTP has been sent to your mobile/email',findMobile.mobile_number);
    } else {
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, 'Mobile number doesnot exist.',null);
    }
  }

  @Post('/forgotPassword')
  @ApiResponse({
    status: 200,
    description: 'An OTP has been sent to your mobile number',
  })
  @ApiResponse({ status: 400, description: 'Mobile number doesnot exist.' })
  async forgotPassword(
    @Body() forgotPasswordDto: forgotPasswordDto,
    @Res() response: Response,
  ) {
    let findUser
     
    if(!forgotPasswordDto.email) {
      findUser = await this.usersService.forgotPassword(
        forgotPasswordDto.mobile,
      );
    }
    else {
      findUser = await this.userRepository.findOne({where: {email_id: forgotPasswordDto.email,is_active: true},relations: ['role']})
    }

    
    if (findUser) {
        let findUserSubscriptionDetails 

        if(findUser.role.id === 1) {
          findUserSubscriptionDetails = await this.UserSubscriptionRepository.findOne({where: {user: {id:findUser.id}}})
        }
   
        if (!findUser.is_verified_user) {
          return this.MiddlewareService.sendResponseTypewithUserData(response,false, 400, 'You have enrolled but verification is not done.', findUser,null);
  
        } else if (
          findUser.is_verified_user && findUser.role.id === 1 && 
          !findUserSubscriptionDetails.is_active
        ) {
            return this.MiddlewareService.sendResponseTypewithUserData(response,false, 400, 'You have enrolled but subscription payment is not done.', findUser,null);
        } else {
  
          await this.generateAndSendOTP(findUser,"updateOtp")
          return this.MiddlewareService.sendResponsewithMessage(response,true, 200, 'An OTP has been sent to your mobile/email.',findUser.mobile_number);
        }
      
    } else {
      let message ;
      if(!forgotPasswordDto.email) {
        message = 'Mobile number doesnot exist.'
      }
      else {
        message = 'email doesnot exist.'
      }
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, message,null);
    }
  }

  @Post('/resetPassword')
  @ApiResponse({
    status: 200,
    description: 'Your password has been reset successfully.',
  })
  @ApiResponse({ status: 401, description: 'user not found with this mobile.' })
  @ApiResponse({
    status: 400,
    description: 'Your Password and confirm Password do not match',
  })
  async resetPassword(
    @Body() resetPasswordDto: resetPasswordDto,
    @Res() response: Response,
  ) {
    if (resetPasswordDto.newPassword != resetPasswordDto.confirmPassword) {
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, 'Your Password and confirm Password do not match.',null);
    } else {
      let User
      if(!resetPasswordDto.email) {
        User = await this.usersService.forgotPassword(
          resetPasswordDto.mobile,
        );
      }
      else {
        User = await this.userRepository.findOne({where: {email_id: resetPasswordDto.email},relations: ['role']})
      }
      if (User) {
        let updatePassword = await this.usersService.updateUser(
          User.id,
          resetPasswordDto,
        );
        if (updatePassword) {
          return this.MiddlewareService.sendResponsewithMessage(response,true, 200, 'Your password has been reset successfully.',null);
        }
      } else {
        return this.MiddlewareService.sendResponsewithMessage(response,true, 401, 'User not found with this mobile.',null);
      }
    }
  }

  @Post('/login')
  @ApiResponse({ status: 200, description: 'User login successful' })
  @ApiResponse({ status: 401, description: 'Incorrect Password' })
  @ApiResponse({ status: 400, description: 'User not found' })
  @ApiHeader({
    name: 'access',
    description: 'For Admin Access',
    required: false,
  })
  async login(
    @Body() LoginDto: LoginDto,
    @Res() response: Response,
    @Headers() headers: any,
  ) {
    //req: Request
    let User = await this.usersService.login(LoginDto.email);
    if (User) {
        let findUserSubscriptionDetails;
        if(User.role.id === 1) {
          findUserSubscriptionDetails = await this.UserSubscriptionRepository.findOne({where: {user: {id:User.id}},relations: ["subscription"]})
        }
         
        const isMatch = await bcrypt.compare(LoginDto.password, User.password);
        let accessToken = await this.AuthService.login(LoginDto.email); //this.MiddlewareService.generateJwtToken(LoginDto.email)
  
        if(isMatch) {
          if (headers && headers.access == 'Admin') {
    
              if(User.image_path != null) {
                User.image_path = await this.FileUploadService.generateCloudFrontUrl(User.image_path)
              }
    
              delete User.password;
              return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'User login successful', User,accessToken);
          } else {
            if (!User.is_verified_user) {
            await this.generateAndSendOTP(User,"updateOtp")
             
              return this.MiddlewareService.sendResponseTypewithUserData(response,false, 400, 'You have enrolled but verification is not done.', User,null);
            } 
            else if (
              User.is_verified_user && User.role.id === 1 &&
               !findUserSubscriptionDetails.is_active
              ) {  
                User['subscriptionDetails'] = findUserSubscriptionDetails
              return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'You have enrolled but subscription payment is not done.', User,null);
            } 
            else {
                //let accessToken = await this.AuthService.generateJwtToken(User)
                if(User.role.id === 1) {
                  let userSub =
                  await this.UserSubscriptionService.findSubscriptionById(User.id);
                let widData =
                  await this.UserSubscriptionService.getSubscribedWidgets(
                    userSub.subscription.id,
                  );
                User['subscription'] = userSub.subscription.plan;
                User['subscriptionId'] = userSub.subscription.id;
                User['widgets'] = widData;
                User['planValidity'] = userSub.subscription_upto
                User['planStatus'] = userSub.subscription.is_active
                User['planAmount'] = userSub.subscription.plan_amount
                if(!userSub.subscription.is_active) {
                  User['planMessage'] = 'Your plan is deactivated .For further details ,please contact admin'
                }
                }
                else if(User.role.id === 4) {
                  let findBusinessDetails = await this.BusinessUserDetailService.getBusinessDetails(User.id)
                  User['planStatus'] = true
                  User['businessDetails'] = findBusinessDetails
                }
    
                delete User.password;
                return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'User login successful', User,accessToken);
              
            }
          }
        }
        else {
          return this.MiddlewareService.sendResponsewithMessage(response,false, 401, "Incorrect Password",null);
        }
      
    } else {
        return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "User not found",null);
    }
  }

  @Get('/UserProfile/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async UserDetails(@Param('id') id: number, @Res() response: Response) {
    let UserDetails = await this.userRepository.findOne({
      where: { id: id, is_active: true },relations: ['city','state', 'role']
    });

    if(UserDetails.image_path != null) {
      UserDetails.image_path = await this.FileUploadService.generateCloudFrontUrl(UserDetails.image_path)
    }

    if(UserDetails.role.id  === 1) {
      let userSub = await this.UserSubscriptionService.findSubscriptionById(id);
      if(userSub) {
        let widData = await this.UserSubscriptionService.getSubscribedWidgets(
          userSub.subscription.id,
        );
        UserDetails['subscription'] = userSub.subscription.plan;
        UserDetails['subscriptionId'] = userSub.subscription.id;
        UserDetails['widgets'] = widData;
        UserDetails['planValidity'] = userSub.subscription_upto
        UserDetails['planStatus'] = userSub.subscription.is_active
        UserDetails['planUpgraded'] = userSub.is_upgraded
            if(!userSub.subscription.is_active) {
              UserDetails['planMessage'] = 'Your plan is deactivated .For further details ,please contact admin'
            }
        if(userSub.subscription.image_path != null) {
          UserDetails['planImage'] = await this.FileUploadService.generateCloudFrontUrl(userSub.subscription.image_path)
        }
      }
    }
    else if (UserDetails.role.id  === 4){
      let userBusinessDetails = await this.BusinessUserDetailService.getBusinessDetails(UserDetails.id)
      if(userBusinessDetails.logo_image_path != null) {
        userBusinessDetails.logo_image_path = await this.FileUploadService.generateCloudFrontUrl(userBusinessDetails.logo_image_path)
      }
      UserDetails['businessDetails'] = userBusinessDetails;
      UserDetails['planStatus'] = true
      let getContent = await this.UserSubscriptionService.getContent("Broadcast Business")
      let getBroadcast = await this.WidgetService.findWidgetById(await this.WidgetService.getWidgetByName("Broadcast"))
      const { created_by, created_on, description, is_active, modified_by, modified_on, ...remainingProperties } = getBroadcast;
        let broadCast = remainingProperties
        broadCast.widget_name = "Broadcast Business"
        broadCast["content"]= getContent.content
        broadCast["t&c"]= getContent.tc
      UserDetails["widgets"] = [broadCast]
    }

    UserDetails["AboutUs"] = await this.contentMasterService.getContentByName("About Us")
    UserDetails["T&C"] = await this.contentMasterService.getContentByName("Terms of use and Privacy policy (LM Club)")
    UserDetails["LM CLUB Rewards"] = await this.contentMasterService.getContentByName("LM CLUB Rewards")

    delete UserDetails.password;
    return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'User Details', UserDetails,null);
  }


  @Post('/generateAcceleratedUrl')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async generateAcceleratedUrl(@Body() gAUrlDto: gAUrlDto,
  @Res() response: Response) {
    let generateUrl = await this.FileUploadService.generateAcceleratedUrl(gAUrlDto.imagePath)
    if(generateUrl) {
      response.status(200).json({
        status: true,
        message: "Image url object created",
        data: generateUrl
      })
    }
    else {
      response.status(400).json({
        status: false,
        message: "error updating Image object"
      })
    }
  }

  @Post('/updateProfile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Body() UpdateProfileDto: UpdateProfileDto,@Res() response: Response,@Request() req) {
    //console.log("req---", req.user.userId,UpdateProfileDto)
    try {
      let findUser = await this.userRepository.findOne({where: {id: req.user.userId}})
      if(findUser) {
         if(UpdateProfileDto.user_name) {
           let findUserNameExists = await this.userRepository.findOne({where: {user_name: UpdateProfileDto.user_name,id: Not(req.user.userId)}})
           if(findUserNameExists) {
             return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "User Name already  exists",null);
           }
           else {
               let update = await this.usersService.updatedetails(req.user.userId,UpdateProfileDto)
               if(update) {
                 return this.MiddlewareService.sendResponsewithMessage(response,true, 200, "User Details updated successfully",null);
               }
           }
         }
         else {
           let update = await this.usersService.updatedetails(req.user.userId,UpdateProfileDto)
               if(update) {
                 return this.MiddlewareService.sendResponsewithMessage(response,true, 200, "User Details updated successfully",null);
               }
         }
      }
      else {
       return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "User not found",null);
      }
    }
    catch(err) {
      //console.log("err", err)
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, err,null);
    }
  }

  @Put('/updateProfilePicture')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
            type: 'string',
            format: 'binary'
        },
      },
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {
    let imageType = ''
    
let image;
    let findUser = await this.userRepository.findOne({where: {id: req.user.userId},relations: ['role']})
    if(findUser) {
      let imagePath
      if (findUser.role.id === 1 || findUser.role.id === 2) {
        imagePath = 'uploads/userprofile/' + req.user.userId + "/" + this.MiddlewareService.unixTimestampSeconds() + "-" + file.originalname

        if(findUser.image_path != null && findUser.image_path != '') {
          let deleteImage = await this.FileUploadService.deleteImageFromS3(findUser.image_path)
          if(deleteImage === true) {
            let uploadImage = await this.FileUploadService.upload(file,imagePath)
            //console.log("uploadImage",uploadImage)
            findUser.image_path = imagePath
            findUser.modified_on = new Date()
            let saveImage = await this.userRepository.save(findUser)
            if(saveImage.image_path != null) {
             image = await this.FileUploadService.generateCloudFrontUrl(saveImage.image_path)
           }
            response.status(200).json({
             status: true,
             message: 'Profile Picture updated successfully',
             image: image
            })
          }
          else {
          return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "Error updating Profile Picture",null);
          }
       }
       else {
         let uploadImage = await this.FileUploadService.upload(file,imagePath)
         findUser.image_path = imagePath
         let saveImage = await this.userRepository.save(findUser)
         if(saveImage.image_path != null) {
           image = await this.FileUploadService.generateCloudFrontUrl(saveImage.image_path)
         }
         response.status(200).json({
          status: true,
          message: 'Profile Picture updated successfully',
          image: image
         })
       }
      }
      else {
        imagePath = 'uploads/businessLogo/' + req.user.userId + "/" + this.MiddlewareService.unixTimestampSeconds() + "-" + file.originalname
        let findBusinessLogo = await this.BusinessUserDetailService.getBusinessDetails(req.user.userId)
        if(findBusinessLogo.logo_image_path != null && findBusinessLogo.logo_image_path != '') {
          let deleteImage = await this.FileUploadService.deleteImageFromS3(findBusinessLogo.logo_image_path)
          if(deleteImage === true) {
            let uploadImage = await this.FileUploadService.upload(file,imagePath)
            //console.log("uploadImage",uploadImage)
            findBusinessLogo.logo_image_path = imagePath
            findBusinessLogo.modified_on = new Date()
            let saveImage = await this.BusinessUserDetailRepository.save(findBusinessLogo)
            if(saveImage.logo_image_path != null) {
             image = await this.FileUploadService.generateCloudFrontUrl(saveImage.logo_image_path)
           }
            response.status(200).json({
             status: true,
             message: 'Business logo updated successfully',
             image: image
            })
          }
          else {
          return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "Error updating Profile Picture",null);
          }
       }
       else {
         let uploadImage = await this.FileUploadService.upload(file,imagePath)
         findBusinessLogo.logo_image_path = imagePath
         let saveImage = await this.BusinessUserDetailRepository.save(findBusinessLogo)
         if(saveImage.logo_image_path != null) {
           image = await this.FileUploadService.generateCloudFrontUrl(saveImage.logo_image_path)
         }
         response.status(200).json({
          status: true,
          message: 'Business logo updated successfully',
          image: image
         })
       }
      }
     
    }
  }

  @Post('/changePassword')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Body() changePasswordDto: changePasswordDto,@Res() response: Response,@Request() req) {

    let findUser = await this.userRepository.findOne({where: {id: req.user.userId}})
    if(findUser) {
      const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, findUser.password);
      if(isMatch) {
         if(changePasswordDto.newPassword == changePasswordDto.confirmPassword) {
            findUser.password = await bcrypt.hash(changePasswordDto.newPassword, 10)
            findUser.modified_on = new Date()
            let changePassword = this.userRepository.save(findUser)
            return this.MiddlewareService.sendResponsewithMessage(response,true, 200, "Your Password changed successfully.",null);
         }
         else {
          return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "Your new Password and confirm Password don't match.",null);
         }
      }
      else {
        return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "Your Old Password is incorrect.",null);
      }
    }
    else {
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "User not found",null);
    }

  }

  @Post("/validateReferralCode")
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        referralCode: {type: "string"},
      },
    }
  })
  async validateRefCode(@Res() response: Response,@Request() req) {

     let findRefCode = await this.usersService.findReferalCode(req.body.referralCode)
     if(findRefCode) {
      return this.MiddlewareService.sendResponsewithMessage(response,true, 200, "Valid Referral Code",null);
     }
     else {
      return this.MiddlewareService.sendResponsewithMessage(response,false, 400, "Invalid Referral Code",null);
     }
  }


  @Post('/signupBusinessUser')
  @ApiOperation({
    summary: 'Sign Up as a Business User',
  })
  @UsePipes(ValidationPipe)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      //required: ['business_name', 'business_email', 'business_mobile', 'business_by', 'business_person_name', 'industry_type', 'services_offered'],
      properties: {
        business_name: { type: 'string' },
        business_email: { type: 'string' },
        business_mobile: { type: 'string' },
        business_by: { type: 'string' },
        business_person_name: { type: 'string' },
        type_of_business: { type: 'string' },
        services_offered: { type: 'string' },
        business_established_date: { type: 'date' },
        location: { type: 'string' },
        operation_hours_from: { type: 'time' },
        operation_hours_to: { type: 'time' },
        password: { type: 'string' },
        city: { type: 'number' },
        state: { type: 'number' },
        zipcode: { type: 'string' },
        street: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary'
        },
        //role: { type: 'string' }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async createBusinessUser(@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {
    try {
      const checkRole = await this.usersService.checkRole(req.body.business_email, req.body.business_mobile, req.body.business_name, 4);
      if (checkRole === "email" || checkRole === "mobile" || checkRole === "username") {
        return this.MiddlewareService.sendResponsewithMessage(response, false, 400, `This ${checkRole} is already in use`,null);
      }
        req.body.role = 4
        let UserExists = await this.usersService.findUser(req.body.business_email);
        if (UserExists) {
          if (!UserExists.is_verified_user) {

          await this.generateAndSendOTP(UserExists,"updateOtp")
            return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'You have enrolled but verification is not done.', UserExists,null);
          } else {
            return this.MiddlewareService.sendResponseTypewithUserData(response,false, 400, 'Business User with this email already exists', UserExists,null);
          }
        } else {
          let mobileExists = await this.usersService.findMobile(
            req.body.business_mobile,
          );
          if (mobileExists) {
            return this.MiddlewareService.sendResponsewithMessage(response, false, 400, 'Mobile number already exists',null);
          } else {
            let userNameExists = await this.usersService.findUsername(
              req.body.business_name,
            );
            if (userNameExists) {
              return this.MiddlewareService.sendResponsewithMessage(response, false, 400, 'Business name already exists',null);
            } else {
              if(file) {
                req.body.file = file
              }
              let UserCreation = await this.usersService.createBusinessUser(req.body);
              if (UserCreation) {
                let UserExists = await this.usersService.findUser(UserCreation.email_id);
    
                   let accessToken = await this.AuthService.login(UserCreation.email_id);

                await this.generateAndSendOTP(UserCreation,"createOtp")
                
                delete UserExists.password;
                return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'Business User signed up successfully', UserExists,accessToken);
              }
            }
          }
        }
    }
    catch(err) {
     // console.log("err", err)
      return this.MiddlewareService.sendResponsewithMessage(response, false, 400, err,null);
    }
    
  }

  @Get('/userCards')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async myCards(@Res() response: Response,@Request() req) {
    let cards = await this.UserCardService.getCards(req.user.userId)
    return this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'User cards', cards,null);
  }

  @Delete("/deleteUser")
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Res() response: Response,@Request() req) {
    try {
      let getUser = await this.userRepository.findOne({where: {id: req.user.userId}})
      getUser.is_active = false
      let saveUserActiveStatus = await this.userRepository.save(getUser)
      return this.MiddlewareService.sendResponsewithMessage(response, true, 200, 'Your account is deleted',null);
    }
    catch(err) {
      return this.MiddlewareService.sendResponsewithMessage(response, false, 400, err,null);
    }
    
  }
  
  // @Post('uploadSample')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //           type: 'string',
  //           format: 'binary'
  //       },
  //     },
  //   }
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadSample(@UploadedFile() file: Express.Multer.File,@Res() response: Response,@Request() req) {
  //   let filePath = 'uploads/sampleprofile/' + this.MiddlewareService.unixTimestampSeconds() + "-" + file.originalname
  //   let uploadPicture = await this.FileUploadService.upload(file,filePath)
  //   response.status(200).json({
  //     status: true,
  //     message: "uploaded",
  //    })
  // }

  // @Get('/emailtest')
  // async emailtest() {

  //   let data = {
  //     name: "vivek",
  //     email: "vivek@yopmail.com",
  //     //subject: "test"
  //   }

  //   // let widget = await this.WidgetService.getWidgetByName("Beehive")
  //   // return widget
  //    await this.EmailService.sendMail(data,"Welcome")    // let data = 'testUrl/home.jpg'
  //   //await this.SmsService.sendOTP(randomNumber,newUser.mobile_number.replace(/[^a-zA-Z0-9 ]/g, ''));
  //   // let input = "[poiufghk][p()vbn mn98765432qwertyuiq2@#$%^&*()"
  //   // let strir = input.replace(/[^a-zA-Z0-9]/g, '');
  //   // console.log("strir",this.MiddlewareService.cleanAndConcatenate("(848) 248-2604"))
  //   // let sendOtp = await this.SmsService.sendOTP(123456,this.MiddlewareService.cleanAndConcatenate("(848) 248-2604"));
  //   //  let sendOtp = await this.SmsService.sendOTP(123456,"+18482482604");
  //     //console.log("sendOtp",sendOtp)
  //   // let generateUrl = await this.FileUploadService.generateAcceleratedUrl(data)
  //   // if(generateUrl) {
  //   //   console.log("generateUrl---",generateUrl)
  //   // }
  //   // else {
  //   //   console.log("generateUrl--",generateUrl)
  //   // }
  // }

//   @Get('/getImageUrl')
//   async getImageUrl() {
//     let data = 'uploads/posts/test/mayEight.jpg'
//     let generateUrl = await this.FileUploadService.generateCloudFrontUrl(data)
//     const expirationTimestamp = 1706507562;

// const expirationDate = new Date(expirationTimestamp * 1000); // Convert seconds to milliseconds
// console.log(new Date(),expirationDate);

// // https://d18z17pxtm3qq3.cloudfront.net/uploads/posts/test/mayTen.jpg?Expires=1706507562&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMTh6MTdweHRtM3FxMy5jbG91ZGZyb250Lm5ldC91cGxvYWRzL3Bvc3RzL3Rlc3QvbWF5VGVuLmpwZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcwNjUwNzU2Mn19fV19&Signature=IwaxHB8jARbIQBpiB8palhuFcSqK7gFMd2ZK3i3P6yeFQp3rGbWmgbqVwWKaybDWQAPwo61EkM3ijFHeCUYFq1e8LEAYssqFeEdPXdF4ojQYMp7hmcih5mENnqCkRwXAHm-UFSnWy4ivCaZ797m8xK9WHJtv8dxDGfVrIY7SlPX%7EsUCUqe8TA1uY99FoLNHoiifUD6ggeHL7Td3jHct%7EoUG5mTgSBrz8diHuJPDku7D6VEJRsyJEzMclAFQtp0HB%7ER0hJqhYA85I5RJQDQO0TtRKzoFMlaJ3iPHjGSBNCoYjSGyKkMa8by0f-020F%7EX8GanMT11LLumor2XxtzGjJw__&Key-Pair-Id=AKIARWKGVWYFS5XGJJGP

//     if(generateUrl) {
//       console.log("generateUrl---",generateUrl)
//     }
//     else {
//       console.log("generateUrl--",generateUrl)
//     }
//   }

  //generateCloudFrontUrl


//   @Get("/test")
//   // findAll() {
//   //   return { message: 'Hello World' };
//   // }
//   async getLastMonth() {
//     // const now = new Date()//await this.MiddlewareService.getEasternTime(); // Assume this returns a Date object
//     // const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
//     // const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

//     // // Calculate the start and end of the last month
//     // const startOfLastMonth = new Date(startOfCurrentMonth);
//     // startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

//     // const endOfLastMonth = new Date(startOfLastMonth.getFullYear(), startOfLastMonth.getMonth() + 1, 0, 23, 59, 59);

//     // return { start: startOfLastMonth, end: endOfLastMonth };
//     let getFreeSubscription = await this.SettingsRepository.findOne({where: {flag: "Free Subscription"}})
//     let startDateTime = await this.MiddlewareService.getEasternTime()
//           // let endTime = startDateTime.setDate(startDateTime.getDate() +  (Number(getFreeSubscription.key)))
//           //let endTime = await this.MiddlewareService.getEasternTime().setDate(await this.MiddlewareService.getEasternTime().getDate() + ( 30 * Number("30")))
//           const currentDate = await this.MiddlewareService.getEasternTime();
//           console.log("currentDate",currentDate)
// const futureDate = new Date(currentDate);
// console.log("futureDate",futureDate)
// futureDate.setDate(futureDate.getDate() + 90);
//           console.log("times",futureDate)
// }
}

