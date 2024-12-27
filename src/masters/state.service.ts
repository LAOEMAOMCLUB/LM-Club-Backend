import { Injectable } from '@nestjs/common';
// import { CreateMasterDto } from './dto/create-master.dto';
// import { UpdateMasterDto } from './dto/update-master.dto';
import { State } from '../models/state.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private stateRepository: Repository<State>,
  ) {}

  async findAllStates() {
    let allStates = await this.stateRepository.find({})
    return allStates;
  }

  async findStateById(id) {
    let getState = await this.stateRepository.findOne({where: {id: id}})
    return getState;
  }

}
