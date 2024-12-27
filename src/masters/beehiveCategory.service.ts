import { Injectable } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BeehiveCategoryMaster } from 'src/models'; 

@Injectable()
export class BeehiveCategoryMasterService {
  constructor(
    @InjectRepository(BeehiveCategoryMaster)
    private BeehiveCategoryMasterRepository: Repository<BeehiveCategoryMaster>,
  ) {}

  async findAllBeehiveCategory() {
    let allBeehiveCategory = await this.BeehiveCategoryMasterRepository.find({order: {
      modified_on: 'DESC', 
    }})
    return allBeehiveCategory;
  }

  async findBeehiveCategoryById(id) {
    let getBeehiveCategory = await this.BeehiveCategoryMasterRepository.findOne({where: {id: id}})
    return getBeehiveCategory;
  }

  async addBeehiveCategory(data) {
    let findBeehiveCategory = await this.BeehiveCategoryMasterRepository.findOne({where: {category_name: data.category_name}})
    if(!findBeehiveCategory) {
       let saveData = await this.BeehiveCategoryMasterRepository.save(data)
       return saveData
    }else {
      return null
    }
  }

  async updateBeehiveCategory(id,data) {
    data.modified_on = new Date()
    let findBeehiveCategory = await this.BeehiveCategoryMasterRepository.findOne({where: {id: id}}) 
    
      if(data.category_name) {
      let result = await this.BeehiveCategoryMasterRepository.findOne({where: {category_name: data.category_name,id: Not(id)}})
      
      if(result) {
        return false
      }
      else {
        return await this.BeehiveCategoryMasterRepository.update(id,data)
      }
       }
       else {
        return await this.BeehiveCategoryMasterRepository.update(id,data)
       }
      
  }
}
