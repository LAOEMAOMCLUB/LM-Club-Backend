import { Injectable } from '@nestjs/common';
// import { CreateMasterDto } from './dto/create-master.dto';
// import { UpdateMasterDto } from './dto/update-master.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from '../models/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async findAllCities(filters) {
    let query = {}
    if(filters.state == null){
      query = {relations: ['state']}
    }
    else {
      query = {
        where: {state: {id: filters.state}},relations: ['state'] //,relations: ['state']
      }
    }
    let allCities = await this.cityRepository.find(query) // relations: ['state']
    // let allCities = await this.cityRepository.find({ where: { state: { 
    //     id: stateId// assuming fk is id
    //  } },relations: ['state'] }) // relations: ['state']
    return allCities;
  }

  async findCityById(id) {
    let getCity = await this.cityRepository.findOne({where: {id: id},relations: ['state']})
    return getCity;
  }
}
