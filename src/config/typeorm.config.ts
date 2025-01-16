import entities from '../models';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import Config from './../../config/config';

const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres', 
  url: Config.db.url,  
  entities: entities,
  synchronize: false, //process.env.NODE_ENV !== 'production'
};

export default dbConfig;

