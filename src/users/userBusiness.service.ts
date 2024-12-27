
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessUserDetail } from 'src/models';
import { Repository } from 'typeorm';

@Injectable()
export class BusinessUserDetailService {
    constructor(
        @InjectRepository(BusinessUserDetail)
        private BusinessUserDetailRepository: Repository<BusinessUserDetail>,
      ) {}

      async getBusinessDetails(userId) {
        return await this.BusinessUserDetailRepository.findOne({where: {user: {id: userId}}})
      }


}
