
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Response, response } from 'express';
import * as moment from 'moment-timezone';
import { Settings } from 'src/models';
import { Repository } from 'typeorm';

@Injectable()
export class MiddlewareService {

  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>
  ){ }

  // Function to get start and end time of today
  async getToday() {
    const now = await this.getEasternTime()  //new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // Set hours, minutes, and seconds to 0
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); // Set hours, minutes, and seconds to end of the day
    return { start, end };
  }
  
  // Function to get start and end time of current week
  async getCurrentWeek() {
    const now = await this.getEasternTime() //new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0); // Set to the start of the week (Sunday)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()), 23, 59, 59); // Set to the end of the week (Saturday)
    return { start, end };
  }
  
  // Function to get start and end time of current month
  async getCurrentMonth() {
    const now = await this.getEasternTime()  //new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0); // Set to the start of the month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // Set to the end of the month
    return { start, end };
  }
  
  async getLastMonth() {
    const now = await this.getEasternTime(); // Assume this returns a Date object
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
    // Calculate the start and end of the last month
    const startOfLastMonth = new Date(startOfCurrentMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  
    const endOfLastMonth = new Date(startOfLastMonth.getFullYear(), startOfLastMonth.getMonth() + 1, 0, 23, 59, 59);
  
    return { start: startOfLastMonth, end: endOfLastMonth };
  }

  async getFreeSubscriptionExpireDate() {
    let getFreeSubscription = await this.settingsRepository.findOne({where: {flag: "Free Subscription"}})
    const currentDate = await this.getEasternTime();
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + Number(getFreeSubscription.key));
    return futureDate
  }
 
  generateFourDigitRandomNumber(): number {
    const min = 100000; // Minimum four-digit number
    const max = 999999; // Maximum four-digit number

    // Generate a random number between min and max
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
  }

  unixTimestampSeconds(): number {
    const unixTimestampSeconds = Math.floor(new Date().getTime() / 1000);
    return unixTimestampSeconds
  }

   generateReferralCode(userId) {
   // const prefix = ''; // Prefix for the referral code
    const length = 7; // Length of the random part of the referral code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Characters to choose from abcdefghijklmnopqrstuvwxyz0123456789//
    let referralCode = '' ;
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
    }

    let rc = userId + "RC@" + referralCode
    rc = rc.slice(0,10)
    return rc;
  }

   getNextMinute() {
    const currentTime = this.getEasternTime()//new Date();
    const nextMinute = new Date(currentTime);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    nextMinute.setSeconds(0);
    nextMinute.setMilliseconds(0);
    return nextMinute;
  }

  async getNearestMinute() {
    const currentTime = this.getEasternTime()//new Date();
    const nearestMinute = new Date(this.getEasternTime());
    nearestMinute.setSeconds(0);
    nearestMinute.setMilliseconds(0);
  
    // If the current second is 30 or more, round up to the next minute
    if (currentTime.getSeconds() >= 30) {
      nearestMinute.setMinutes(nearestMinute.getMinutes() + 1);
    }
  
    return nearestMinute;
  }

  async getPastTwoMinutesTime() {
    const currentTime = this.getEasternTime()//new Date();
    var twoMinutesEarlier = new Date(currentTime.getTime() - 2 * 60000);
    twoMinutesEarlier.setSeconds(0);
    twoMinutesEarlier.setMilliseconds(0);
    return twoMinutesEarlier
  }

  getCurrentEasternMinute() {
    const currentTime = new Date();
    const currentMinute = new Date(this.getEasternTime());
    //nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    currentMinute.setSeconds(0);
    currentMinute.setMilliseconds(0);
    return currentMinute;
  }

  getCurrentMinute() {
    const currentTime = this.getEasternTime()//new Date();
    const currentMinute = new Date(currentTime);
    //nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    currentMinute.setSeconds(0);
    currentMinute.setMilliseconds(0);
    return currentMinute;
  }

    getEasternTime() {
    let currentTime =  moment.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
    return new Date(currentTime)
  }

  cleanAndConcatenate(inputString) {
    let cleanedString = inputString.replace(/[^a-zA-Z0-9]/g, '');
    let concatenatetring =  '+1' + cleanedString;
    return concatenatetring
  }

  // private sendResponseTypewithUserData(response: Response, status: boolean, statusCode: number, message: string, data: any,accessToken: any) {
  //   if(!accessToken) {
  //     return response.status(statusCode).json({
  //       status: status,
  //       message: message,
  //       data: data
  //     });
  //   }
  //   else {
  //     return response.status(statusCode).json({
  //       status: status,
  //       message: message,
  //       data: data,
  //       accessToken: accessToken
  //     });
  //   }
    
  // }
  // returnResponse(response: Response, status: boolean, statusCode: number, message: string, data: any,accessToken: any) {
  //  if(!accessToken) {
  //     return response.status(statusCode).json({
  //       status: status,
  //       message: message,
  //       data: data
  //     });
  //   }
  //   else {
  //     return response.status(statusCode).json({
  //       status: status,
  //       message: message,
  //       data: data,
  //       accessToken: accessToken
  //     });
  //   }
  // }

    sendResponseTypewithUserData(response: Response, status: boolean, statusCode: number, message: string, data: any,accessToken: any) {
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
  
  sendResponsewithMessage(response: Response, status: boolean, statusCode: number, message: string, mobile: any) {
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

}
