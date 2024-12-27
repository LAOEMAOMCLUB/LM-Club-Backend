import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentMaster } from 'src/models';

@Injectable()
export class contentMasterService {
  constructor(
    @InjectRepository(ContentMaster)
    private ContentMasterRepository: Repository<ContentMaster>
  ) {}

  async findAllContents() {
    let allContents = await this.ContentMasterRepository.find({order: {
      modified_on: 'DESC', 
    }})

    return allContents;
  }

  async findContentById(id) {
    let getContent = await this.ContentMasterRepository.findOne({where: {id: id}})
    return getContent;
  }

  async getContentByName(name) {
    let getContent = await this.ContentMasterRepository.findOne({where: {name: name},select: ["name","content"]})
    return getContent;
  }

  async updateContent(id,data) {
    data.modified_on = new Date()
    let findContent = await this.ContentMasterRepository.findOne({where: {id: id}}) 
    
      if(data.name) {
      let result = await this.ContentMasterRepository.findOne({where: {name: data.name,id: Not(id)}})
      
      if(result) {
        return false
      }
      else {
        return await this.ContentMasterRepository.update(id,data)
      }
       }
       else {
        return await this.ContentMasterRepository.update(id,data)
       }
      
  }





 
 

}