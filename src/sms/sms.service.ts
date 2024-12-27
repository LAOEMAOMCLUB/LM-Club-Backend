
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

import Config from "./../../config/config"

@Injectable()
export class SmsService {
  private client: Twilio.Twilio;

  constructor() { 
    // Initialize Twilio client
    this.client = Twilio(
        Config.twilio.accountSid , 
        Config.twilio.authToken  
    );
  }

  async sendOTP(otp: any,mobile) {
    //console.log("process.env.TWILIO_FROM",process.env.TWILIO_FROM,mobile)
    try {
      const message = await this.client.messages.create({
        body: otp,
        from: Config.twilio.from ,
        to: mobile //'+18482482604'
      });

      return message;
    }
    catch (error) {
      //console.log(error);
      return error;
    }
  }
}
