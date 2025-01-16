import { Module } from '@nestjs/common';
import { MiddlewareService } from './middleware.service';
import { FileUploadService } from "./s3.service"
import { Settings } from 'src/models';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Settings]),
  // TwilioModule.forRoot({
  //   accountSid: "ACe26263bd307096a0257d1aabc283e48e",
  //   authToken: "02f974582de5e05dec2d524976931b10"
  // })
],
  controllers: [],
  providers: [MiddlewareService,FileUploadService],
})
export class MiddlewareModule {}