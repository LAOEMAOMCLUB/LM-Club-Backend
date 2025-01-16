import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserDetail } from '.././models/user.entity';
import * as bcrypt from 'bcrypt';
//import { TwilioService } from 'nestjs-twilio';
import { UserSubscriptionService } from "./userSubscription.service";
import { UserSubscription } from 'src/models';
import { UserReferral } from 'src/models'; 
import { ReferralRewardTransaction } from "src/models";
import { RewardPointsMaster } from 'src/models';
import { BusinessUserDetail } from 'src/models';
import { FileUploadService } from 'src/middleware/s3.service';
import { MiddlewareService } from '../middleware/middleware.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserDetail)
    private userRepository: Repository<UserDetail>,

    @InjectRepository(UserSubscription)
    private UserSubscriptionRepository: Repository<UserSubscription>,

    private readonly UserSubscriptionService: UserSubscriptionService,

    @InjectRepository(UserReferral)
    private UserReferralRepository: Repository<UserReferral>,

    @InjectRepository(ReferralRewardTransaction)
    private ReferralRewardTransactionRepository: Repository<ReferralRewardTransaction>,

    @InjectRepository(RewardPointsMaster)
    private RewardPointsMasterRepository: Repository<RewardPointsMaster>,

    @InjectRepository(BusinessUserDetail)
    private BusinessUserDetailRepository: Repository<BusinessUserDetail>,

    private readonly FileUploadService: FileUploadService,
    private readonly MiddlewareService: MiddlewareService
    
  ) //private readonly twilioService: TwilioService
  {}

  async create(createUserDto) {
    let saveUserData = {
      user_name: createUserDto.username,
      email_id: createUserDto.email,
      password: await bcrypt.hash(createUserDto.password, 10),
      mobile_number: createUserDto.mobile,
      street: createUserDto.street,
      zipcode: createUserDto.zipcode,
      referral_code_applied: null,
      role: createUserDto.role_id,
      //is_active: true, //comment later
    };
    if (createUserDto.city) {
      saveUserData['city'] = createUserDto.city;
    }
    if (createUserDto.state) {
      saveUserData['state'] = createUserDto.state;
    }

    if (createUserDto.referalCode) {
      saveUserData.referral_code_applied = createUserDto.referalCode;
    }

    //createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    let saveUser = await this.userRepository.save(saveUserData);
    //console.log("save--",saveUser)
    let subscriptionData = {
      user: {id: saveUser.id},
      // subscription: createUserDto.planId,
      created_by: saveUser.id,
      modified_by: saveUser.id,
      // subscription_from: createUserDto.subscription_from,
      // subscription_upto: createUserDto.subscription_upto
    }
    if(createUserDto.planId) {
      subscriptionData["subscription"] = createUserDto.planId
    }
    else {
      subscriptionData["subscription"] = 5
    }
    //console.log("subscriptionData--",subscriptionData)
    let saveUserSubscription = await this.UserSubscriptionRepository.save(subscriptionData)
    return saveUser
  }

  async checkRole(email,mobile,username,role) {
    let CheckUserEmail = await this.userRepository.findOne({where:{email_id:email,is_active: true},relations: ["role"]})
    let CheckUserMobile = await this.userRepository.findOne({where:{mobile_number:mobile,is_active: true},relations: ["role"]})
    let CheckUserUserName = await this.userRepository.findOne({where:{user_name:username,is_active: true},relations: ["role"]})
    if(CheckUserEmail && CheckUserEmail.role.id != role) {
      return "email"
    }
    else if(CheckUserMobile && CheckUserMobile.role.id != role) {
      return "mobile"
    }
    else if(CheckUserUserName && CheckUserUserName.role.id != role) {
      return "username"
    }
  }

  async findUser(email) {
    const User = await this.userRepository.findOne({
      where: { email_id: email,is_active: true },relations: ["role","state","city"]
    });
    if (User) {
      return User;
    } else {
      return null;
    }
  }

  async findMobile(mobile) {
    const User = await this.userRepository.findOne({
      where: { mobile_number: mobile, is_active : true },
    });
    if (User) {
      return true;
    } else {
      return false;
    }
  }

  async forgotPassword(mobile) {
    const User = await this.userRepository.findOne({
      where: { mobile_number: mobile,is_active: true },relations: ['role'] //, is_active: true
    });
    if (User) {
      return User;
    } else {
      return null;
    }
  }

  async login(email) {
    const user = await this.userRepository.findOne({
      where: { email_id: email, is_active: true },
      relations: ['role','state','city'],
      //select: ['id', 'user_name','mobile','plan_type','street','city','state','zipcode']
    });
    if (user) {
      return user;
    }
  }

  async findUsername(username) {
    const user = await this.userRepository.findOne({
      where: { user_name: username, is_active: true },
      //select: ['id', 'user_name','mobile','plan_type','street','city','state','zipcode']
    });
    if (user) {
      return user;
    }
  }

  async makeUserVerified(data) {
    let User = await this.userRepository.findOne({
      where: { mobile_number: data.mobile },
    });
    User.is_verified_user = true;
    return this.userRepository.save(User);
  }

  async updateUser(id, data) {
    let User = await this.userRepository.findOne({ where: { id: id } });
    if (data.is_active) {
      User.is_active = true;
    }
    if (data.newPassword) {
      User.password = await bcrypt.hash(data.newPassword, 10);
    }
    return this.userRepository.save(User);
  }

  async updatedetails(id, data) {
    //console.log("data", data)
    let findBusinessDetails = await this.BusinessUserDetailRepository.findOne({where: {user: {id: id}}})
    let findUserDetails = await this.userRepository.findOne({where: {id: id}})
    let userData = {}
    data.modified_on = new Date()
    if(data.business_person_name) {
      findBusinessDetails.business_person_name = data.business_person_name
     // delete data.business_person_name
    }
    if(data.business_by) {
      findBusinessDetails.business_by = data.business_by
//delete data.business_by
    }
    if(data.business_established_date) {
      findBusinessDetails.business_established_date = data.business_established_date
      //delete data.business_established_date
    }
    if(data.type_of_business) {
      findBusinessDetails.type_of_business = data.type_of_business
     // delete data.type_of_business
    }
    if(data.services_offered) {
      findBusinessDetails.services_offered = data.services_offered
     // delete data.services_offered
    }
    if(data.location) {
      findBusinessDetails.location = data.location
     // delete data.location
    }
    if(data.operation_hours_from) {
      findBusinessDetails.operation_hours_from = data.operation_hours_from
      //delete data.operation_hours_from
    }
    if(data.operation_hours_to) {
      findBusinessDetails.operation_hours_to = data.operation_hours_to
     // delete data.operation_hours_to
    }
    if(data.business_person_name || data.business_by || data.business_established_date || data.type_of_business || data.services_offered || data.location || data.operation_hours_from || data.operation_hours_to) {
     // let updateBusinessData = await this.BusinessUserDetailRepository.save(findBusinessDetails)
     let updateBusinessData = await this.BusinessUserDetailRepository.save(findBusinessDetails)
    }

    if(data.user_name) {
      findUserDetails.user_name = data.user_name
    }
    if(data.street) {
      findUserDetails.street = data.street
    }
    if(data.city) {
      findUserDetails.city = data.city
    }
    if(data.state) {
      findUserDetails.state = data.state
    }
    if(data.zipcode) {
      findUserDetails.zipcode = data.zipcode
    }
    //console.log("daa", userData)
    
    return await this.userRepository.save(findUserDetails)
  }

  async findOne(
    email_id: string,
    password: string,
  ): Promise<UserDetail | undefined> {
    try {
      const user = await this.userRepository.findOne({
        where: { email_id },
      });
      const isMatch = await bcrypt.compare(password, user.password);
      if (user && isMatch) {
        return user;
      } else {
        throw new Error(`User not found`);
      }
    } catch (err) {
      throw new Error(`Error finding ${err} user ${err.message}`);
    }
  }

  // async sendOTP(otp: any) {
  //   try {
  //     const message = await this.twilioService.client.messages.create({
  //       body: otp,
  //       from: '+18886884611',
  //       to: '+18777804236'
  //     });

  //     return message;
  //   }
  //   catch (error) {
  //     // You can implement your fallback code here
  //     console.error(error);
  //     return error;
  //   }
  // }

  async getAllUsers() {
    let allUsers = await this.userRepository.find({});
    return allUsers;
  }

  async findByUsername(username) {
    return this.userRepository.findOne({ where: {user_name: username} });
  }

  async findByMobileNumber(mobileNumber){
    return this.userRepository.findOne({ where: {mobile_number: mobileNumber} });
  }

  async findByEmail(email) {
    return this.userRepository.findOne({ where: {email_id: email} });
  }

  async findReferalCode(referalCode) {
    return await this.UserReferralRepository.findOne({where: {referral_code: referalCode},relations: ['user']})
  }

  async pointsMaster(reward_type) {
    return await this.RewardPointsMasterRepository.findOne({where: {reward_type: reward_type,is_active: true}})
  }

  async saveRefCode(userId,referralCode) {
    //console.log("u,serId,referralCode",userId,referralCode)
    let referralCodeData = {
      user: {id: userId},
      valid_from: new Date(), 
      valid_upto: new Date(), // update later
      referral_code: referralCode
    }
    return await this.UserReferralRepository.save(referralCodeData)
  }

  async savePoints(userId,referalCodeId,points) {
    let PointsData = {
      user: {id: userId},
      transaction_date: new Date(),
      transaction_type: "C",
      userReferral: {id: referalCodeId},
      source: "",
      points: points
     }
     return await this.ReferralRewardTransactionRepository.save(PointsData)
  }

  async getRecordsCount(userId,referalCodeId) {
    return await this.ReferralRewardTransactionRepository.count({where: {user: {id: Not(userId)},userReferral: {id: referalCodeId}}})
  }

  async createBusinessUser(data) {
     let userData = {
       email_id: data.business_email,
       mobile_number: data.business_mobile,
       password: await bcrypt.hash(data.password, 10),
       user_name: data.business_name,
       role: data.role,
       state: {id : data.state},
       city: {id: data.city},
       zipcode: data.zipcode,
       street: data.street
     }
     let saveUserData =  await this.userRepository.save(userData);
     let businessData = {
      business_person_name: data.business_person_name,
      business_by: data.business_by,
      type_of_business: data.type_of_business,
      business_established_date: data.business_established_date,
      location: data.location,
      operation_hours_from: data.operation_hours_from,
      operation_hours_to: data.operation_hours_to,
      user: {id: saveUserData.id}
     }
     if(data.services_offered) {
      businessData['services_offered'] = data.services_offered
     }
     
     if(data.file) {
      let imagePath = 'uploads/businessLogo/' + saveUserData.id + "/" + this.MiddlewareService.unixTimestampSeconds() + "-" + data.file.originalname
      let uploadImage = await this.FileUploadService.upload(data.file,imagePath)
      businessData['logo_image_path'] = imagePath
     }
     
     let saveBusinessDetails = await this.BusinessUserDetailRepository.save(businessData)
     return saveUserData
  }
}
