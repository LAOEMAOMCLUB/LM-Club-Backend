import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  paymentDto
} from './dto/payment.dto';

import { PaymentService } from 'src/payment/payment.service';
import { UserSubscription } from 'src/models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDetail } from 'src/models';
import { UserSubscriptionService } from "./../users/userSubscription.service"
import { CardDetail } from 'src/models';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/email/email.service';
import { UsersService } from 'src/users/users.service';
import { MiddlewareService } from "./../middleware/middleware.service"
import { NotificationService } from "./../notification/notification.service"

@ApiTags('payment')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly PaymentService: PaymentService,
    private readonly UserSubscriptionService: UserSubscriptionService,

    @InjectRepository(UserSubscription)
    private UserSubscriptionRepository: Repository<UserSubscription>,

    @InjectRepository(UserDetail)
    private UserDetailRepository: Repository<UserDetail>,

    @InjectRepository(CardDetail)
    private CardDetailRepository: Repository<CardDetail>,

    private readonly AuthService: AuthService,
    private readonly MailService: MailService,
    private readonly usersService: UsersService,
    private readonly MiddlewareService: MiddlewareService,
    private readonly NotificationService: NotificationService
  ) { }

  @Post('/planPayment')
  @UsePipes(ValidationPipe)
  async subscribePlanPayment(@Body() paymentDto: paymentDto, @Res() response: Response) {
    // let subscribePlan = await this.PaymentService.checkout(paymentDto)

    // let result = subscribePlan[Object.keys(subscribePlan)[1]]

    //if (subscribePlan.success && result === true) {
      if (paymentDto.payment_for && paymentDto.payment_for === "Broadcast") {
          response.status(200).json({
            status: true,
            message: "Your payment is successful"
          })
        // let findExistingCard = await this.CardDetailRepository.findOne({ where: { user: { id: paymentDto.userId }, card_number: paymentDto.card_number } })
        // if (findExistingCard) {
        //   if (findExistingCard.card_holder_name !== paymentDto.card_holder_name) {
        //     findExistingCard.card_holder_name = paymentDto.card_holder_name
        //     let saveCardDetails = await this.CardDetailRepository.save(findExistingCard)
        //   }
        //   response.status(200).json({
        //     status: true,
        //     message: "Your payment is successful"
        //   })
        // }
        // else {
        //   let CardData = {
        //     user: { id: paymentDto.userId },
        //     card_holder_name: paymentDto.card_holder_name,
        //     card_number: paymentDto.card_number
        //   }
        //   let saveCardDetails = await this.CardDetailRepository.save(CardData)
        //   response.status(200).json({
        //     status: true,
        //     message: "Your payment is successful"
        //   })
        // }
      }
      else {
        let userSub = await this.UserSubscriptionRepository.findOne({ where: { user: { id: paymentDto.userId } }, relations: ['user', 'subscription'] });
        if(!userSub.is_upgraded && userSub.subscription.plan === "FREE") {
          userSub.is_upgraded = true
        }
        let subscriptionData = {
          subscription: { id: paymentDto.planId },
          subscription_from: paymentDto.subscription_from,
          subscription_upto: paymentDto.subscription_upto,
          is_active: true
        }
        let updateUserSubscription = await this.UserSubscriptionRepository.update(userSub.id, subscriptionData)

        // let CardData = {
        //   user: { id: paymentDto.userId },
        //   card_holder_name: paymentDto.card_holder_name,
        //   card_number: paymentDto.card_number
        // }
        // let saveCardDetails = await this.CardDetailRepository.save(CardData)
        let accessToken = await this.AuthService.login(userSub.user.email_id);
        let emailData = {
          email: userSub.user.email_id,
          plan: userSub.subscription.plan,
          validUpto: paymentDto.subscription_upto,
          name: userSub.user.user_name
        }

        let sendMail = await this.MailService.sendMail(emailData, 'payment');

        if (!userSub.is_active) {

          await this.PaymentService.freePlanSubscription(userSub)
        }

        response.status(200).json({
          status: true,
          message: "Your payment is successful",
          token: accessToken
        })
      }

    // }
    // else {
    //   // code = 400
    //   response.status(400).json({
    //     status: false,
    //     message: "Payment failed"
    //   })
    // }

  }


}


