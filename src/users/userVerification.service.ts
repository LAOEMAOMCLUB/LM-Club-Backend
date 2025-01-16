
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserVerification } from 'src/models';
import { Repository } from 'typeorm';

@Injectable()
export class UserVerificationService {
    constructor(
        @InjectRepository(UserVerification)
        private UserVerificationRepository: Repository<UserVerification>,
      ) {}

      async addOtp(otpData) {
        let findMobile = await this.UserVerificationRepository.findOne({where: {mobile_number: otpData.mobile_number}})
        if(findMobile) {
           findMobile.user = otpData.user
           findMobile.verification_code= otpData.verification_code
           return this.UserVerificationRepository.save(findMobile)
        }
        else {
          return this.UserVerificationRepository.save(otpData)
        }
       }

       async updateOtp(otpData) {
        let UserOtpRecord = await this.UserVerificationRepository.findOne({where: {user: {id: otpData.id}}})
        if(UserOtpRecord) {
          UserOtpRecord.verification_code = otpData.verification_code
          return await this.UserVerificationRepository.save(UserOtpRecord)
        }
        else {
          let saveData = {
            user: {id: otpData.id},
            verification_code: otpData.verification_code
          }
          return await this.UserVerificationRepository.save(saveData)
        }
        
       }

       async verifyotp(otpData) {
        let checkOtp
        if(otpData.mobile) {
          checkOtp = await this.UserVerificationRepository.findOne({where: {mobile_number: otpData.mobile}})
        }
        else {
          checkOtp = await this.UserVerificationRepository.findOne({where: {user: {id: otpData.id}}})
        }

        if(checkOtp) {
            if(otpData.otp === checkOtp.verification_code) {
               return true
            }
            else {
               return false
            }
        }
       }

       async findUser(id) {
        return this.UserVerificationRepository.findOne({where: {user: {id: id}}})
       }

}
