
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardDetail } from 'src/models';
import { Repository } from 'typeorm';

@Injectable()
export class UserCardService {
    constructor(
        @InjectRepository(CardDetail)
        private CardDetailRepository: Repository<CardDetail>,
      ) {}

async getCards(userId) {
   return await this.CardDetailRepository.find({where: {user: {id: userId}}})
}

}
