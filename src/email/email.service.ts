// mail.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { EmailTemplate } from 'src/models';
import { Repository } from 'typeorm';
import * as path from 'path';

import Config from "./../../config/config"

@Injectable()
export class MailService {
  private transporter;

  constructor( 
    @InjectRepository(EmailTemplate)
    private EmailTemplateRepository: Repository<EmailTemplate>
    ) {
    this.transporter = nodemailer.createTransport({
      service: "office365",
      host: Config.smtp.host,
      auth: {
        user: Config.smtp.user,
        pass: Config.smtp.password 
      },
    });
  }

  async sendMail(data,type) { 
    let updateEmail;
    let email;
    if(type == 'otp') {
      email = await this.EmailTemplateRepository.findOne({where: {id: 1}})
      updateEmail =  email.message.replace('{userName}', data.name) 
      updateEmail = updateEmail.replace('{otp}',data.otp)
    }
    else if (type == 'payment') {
      email = await this.EmailTemplateRepository.findOne({where: {id: 2}})
      updateEmail = email.message.replace('{userName}',data.name)
      updateEmail = updateEmail.replace('{Plan}',data.plan)
      updateEmail = updateEmail.replace('{Validupto}',data.validUpto)
    }
    else if (type === "Broadcast") {
      email = await this.EmailTemplateRepository.findOne({where: {id: 3}})
      updateEmail = email.message.replace('{userName}',data.name)
      updateEmail = updateEmail.replace('{BusinessName}',data.businessName)
      // updateEmail = updateEmail.replace('{Validupto}',data.validUpto)
    }
    else if (type === "Welcome") {
      email = await this.EmailTemplateRepository.findOne({where: {id: 4}})
      updateEmail = email.message.replace('{userName}',data.name)
    }

    updateEmail = updateEmail.replace('{Logo}',"https://devlmclub.s3.amazonaws.com/Laoe-Maom.png")
   
    const mailOptions = {
      from: Config.smtp.user, 
      to: data.email,
      subject: email.subject,
      html: updateEmail,
    };

    try {

      var mailObj = await this.transporter.sendMail(mailOptions);
      //console.log("mailObj==",mailObj)
      return new Promise((resolve, reject) => {
        //console.log("result==",mailObj)
          return resolve({
              success: true,
          });
      });
  } catch (e) {
      //console.log('e', e);
      return new Promise((resolve, reject) => {
          return resolve({
              success: false
          });
      });
  }
    
  }
}
