import { Injectable } from '@nestjs/common';
import { EmailTemplate } from '../models/emailTemplate.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private EmailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async findAllEmailTemplates() {
    let allEmailTemplates = await this.EmailTemplateRepository.find({order: {
      modified_on: 'DESC', 
    }})
    return allEmailTemplates;
  }

  async findEmailTemplateById(id) {
    let getEmailTemplate = await this.EmailTemplateRepository.findOne({where: {id: id}})
    return getEmailTemplate;
  }

  async createEmailTemplate(data) {
    let findTemplate = await this.EmailTemplateRepository.findOne({where: {name: data.name}}) 
    if(findTemplate) {
      return null
    }
    else {
      let saveData = await this.EmailTemplateRepository.save(data)
      return saveData
    }
  }

  async updateEmailTemplate(id,data) {
    data.modified_on = new Date()
    //console.log("dataOne---", data)
    let findEmailTemplate = await this.EmailTemplateRepository.findOne({where: {id: id}})

     if(data.name) {
       let findExistingtemplate = await this.EmailTemplateRepository.findOne({where: {name: data.name,id: Not(id)}})
       if(findExistingtemplate) {
          return null
       }
       else {
         let saveData = await this.EmailTemplateRepository.update(id, data)
         return saveData
       }
     }
     else {
      let saveData = await this.EmailTemplateRepository.update(id, data)
      return saveData
     }
  }

}
