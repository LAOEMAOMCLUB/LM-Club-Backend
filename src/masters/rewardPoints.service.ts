import { Injectable } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardPointsMaster } from 'src/models'; 

@Injectable()
export class RewardPointsMasterService {
  constructor(
    @InjectRepository(RewardPointsMaster)
    private RewardPointsMasterRepository: Repository<RewardPointsMaster>,
  ) {}

  async findAllPointsMaster() {
    let allPointsMaster = await this.RewardPointsMasterRepository.find({order: {
      modified_on: 'DESC', 
    }})
    for(let i = 0; i < allPointsMaster.length; i ++) {
      const floatNumber = parseFloat(allPointsMaster[i].points.toString());
  
      // Check if the number is an integer
      if (Number.isInteger(floatNumber)) {
        // If it's an integer, return it as it is
        //  console.log(floatNumber.toString());
         allPointsMaster[i].points = floatNumber

      } else {
        // If it's a floating-point number, return it with two decimal places
        // console.log(floatNumber.toFixed(2));
        allPointsMaster[i].points = Number(floatNumber.toFixed(2))
      }
    }

    return allPointsMaster;
  }

  async findPointsMasterById(id) {
    let getPointsMaster = await this.RewardPointsMasterRepository.findOne({where: {id: id}})
    const floatNumber = parseFloat(getPointsMaster.points.toString());
  
      // Check if the number is an integer
      if (Number.isInteger(floatNumber)) {
        // If it's an integer, return it as it is
        //  console.log(floatNumber.toString());
        getPointsMaster.points = floatNumber

      } else {
        // If it's a floating-point number, return it with two decimal places
        // console.log(floatNumber.toFixed(2));
        getPointsMaster.points = Number(floatNumber.toFixed(2))
      }
    return getPointsMaster;
  }


  async addPointsMaster(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if(data[key] == "" || data[key] == null) {
          delete data[key]
        }
      }
    }
    let findPointsMaster = await this.RewardPointsMasterRepository.findOne({where: {reward_type: data.reward_type}})
    if(findPointsMaster) {
       return null
    }
    else {
      let savePointsMaster = await this.RewardPointsMasterRepository.save(data)
      return savePointsMaster
    }
  }

  async updatePointsMaster(id,data) {
    data.modified_on = new Date()
    //console.log("dataOne---", data)
    let findPointsMaster = await this.RewardPointsMasterRepository.findOne({where: {id: id}})
     if(data.reward_type) {
      const findExistingPointsMaster = await this.RewardPointsMasterRepository.findOne({
        where: {
          reward_type: data.reward_type,
          id: Not(id)
        }
      });
       if(findExistingPointsMaster) {
          return null
       }
       else {
          if(data.reward_type) {
            findPointsMaster.reward_type = data.reward_type
          }
          if(data.points) {
            findPointsMaster.points = data.points
          }
          if(data.is_active  === true) {
            findPointsMaster.is_active = data.is_active
          }
          else {
            findPointsMaster.is_active = data.is_active
          }
         let saveData = await this.RewardPointsMasterRepository.save(findPointsMaster)
         return saveData
       }
     }
     else {
      if(data.reward_type) {
        findPointsMaster.reward_type = data.reward_type
      }
      if(data.points) {
        findPointsMaster.points = data.points
      }
      if(data.is_active  === true) {
        findPointsMaster.is_active = data.is_active
      }
      else {
        findPointsMaster.is_active = data.is_active
      }
      let saveData = await this.RewardPointsMasterRepository.save(findPointsMaster)
      return saveData
     }
  }

  async shareTypes() {
    let rewardType = "Share"
    return await this.RewardPointsMasterRepository.createQueryBuilder("reward_points_master")
    .where("reward_points_master.reward_type ILIKE :rewardType", { rewardType: `%${rewardType}%` })
    .getMany();
  }
}
