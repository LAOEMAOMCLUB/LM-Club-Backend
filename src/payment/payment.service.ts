// braintree.service.ts
import { Injectable } from '@nestjs/common';
import * as braintree from 'braintree';
import Config from "./../../config/config"  
import { UsersService } from 'src/users/users.service';
import { MiddlewareService } from "./../middleware/middleware.service"
import { NotificationService } from "./../notification/notification.service"
import { MailService } from 'src/email/email.service';

@Injectable()
export class PaymentService {
  private gateway: braintree.BraintreeGateway;

  constructor(
    private readonly UsersService: UsersService,
    private readonly MiddlewareService: MiddlewareService,
    private readonly NotificationService: NotificationService,
    private readonly MailService: MailService
  ) {
    this.gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: Config.payment.merchantId, 
      publicKey: Config.payment.publicKey, 
      privateKey: Config.payment.privateKey, 
    });
  }

  async checkout(data) {
   let check = await this.gateway.transaction
    .sale({
      amount: data.amount,
      paymentMethodNonce: data.nonce,
      options: {
        submitForSettlement: true,
      },
    })
    //console.log("check",check)
      return check
  }


  async freePlanSubscription(data) {
    let saveRefCode = await this.UsersService.saveRefCode(data.user.id, this.MiddlewareService.generateReferralCode(data.user.id))
    if (data.user.referral_code_applied) {
      let findRefCode = await this.UsersService.findReferalCode(data.user.referral_code_applied)

      if (findRefCode && findRefCode.is_active) { //&& new Date() <= findRefCode.valid_upto
        let PointsMaster = await this.UsersService.pointsMaster('Refer & Earn')

        let savePoints1 = await this.UsersService.savePoints(data.user.id, findRefCode.id, PointsMaster.points)
        let createNewReferralNotification1 = await this.NotificationService.createReferralNotification(data.user.id, "new Referral", PointsMaster.points)
        let savePoints2 = await this.UsersService.savePoints(findRefCode.user.id, findRefCode.id, PointsMaster.points)
        let createNewReferralNotification2 = await this.NotificationService.createReferralNotification(findRefCode.user.id, "Referral Used", PointsMaster.points)
        let getBonusCount = await this.UsersService.getRecordsCount(findRefCode.user.id, findRefCode.id)
        if (getBonusCount !== 0 && getBonusCount % 10 === 0) {
          let BonusPointsMaster = await this.UsersService.pointsMaster('Referral Bonus')
          let savePoints2 = await this.UsersService.savePoints(findRefCode.user.id, findRefCode.id, BonusPointsMaster.points)
          let createNewReferralNotification2 = await this.NotificationService.createReferralNotification(findRefCode.user.id, "10th referral", BonusPointsMaster.points)
          //Referral Bonus
        }
      }
    }

    let edata = {
      name: data.user.user_name,
      email: data.user.email_id,
      //subject: "test"
    }
    await this.MailService.sendMail(edata, "Welcome")
    return true
  }

}

