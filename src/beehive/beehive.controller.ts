import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
    UsePipes,
    ValidationPipe,
    Param,
    Req,
    Res,
    Headers,
    Put,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Query,
  } from '@nestjs/common';
  import { Response } from 'express';
  import * as bcrypt from 'bcrypt';

  import {
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiConsumes,
    ApiBody,
    ApiBearerAuth,
    ApiQuery,
  } from '@nestjs/swagger';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/middleware/s3.service';
//import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';

import { HasRoles } from '../auth/has-roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';

import { BeehivePostService } from "./beehive.service"
import { BroadcastPostMedia } from 'src/models';
import { BeehivePostMedia } from 'src/models';

import {
  deleteFileDto
} from './dto/beehive.dto';

enum Types {
  Like = 'like',
  Dislike = 'dislike',
  Save = 'save',
  Remove = 'remove'
}

@ApiTags('beehivePost')
@Controller('beehivePost')

export class BeehiveController {
    constructor(
        @InjectRepository(BroadcastPostMedia)
        private BroadcastPostMediaRepository: Repository<BroadcastPostMedia>,

        @InjectRepository(BeehivePostMedia)
        private BeehivePostMediaRepository: Repository<BeehivePostMedia>,
    
        private readonly FileUploadService: FileUploadService,
        //private readonly AuthService: AuthService,
        private readonly BeehivePostService: BeehivePostService
      ) 
      {}

      @Post('uploadBeehivePost')
      @ApiBearerAuth('JWT-auth')
      @HasRoles(Role.User)
      @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          category: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          is_draft: { type: 'boolean' },
          coupon_code: { type: 'string' },
          valid_from: { type: 'string' },
          valid_upto: { type: 'string' },
          company_name: { type: 'string' },
          id: { type: 'integer' },
          event_start_time: {type: 'time'},
          event_end_time: {type: 'time'},
          // file: {
          //   type: 'string',
          //   format: 'binary'
          // },
          files: {
            type: 'array', 
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })
   // @UseInterceptors(FileInterceptor('file'))
   @UseInterceptors(FilesInterceptor('files'))
   async uploadBeehivePost(@UploadedFiles() files: Express.Multer.File[],@Res() response: Response,@Request() req) {
      req.body.userId = req.user.userId

      if(files) {
        req.body.file = files
      }
    //   console.log("payloadFiles---",file)
       //console.log("req", req.body)  //comment later
      await this.BeehivePostService.uploadBeehivePost(req.body).then((post) => {
           if(post) {
        let message = ''
        if(req.body.id) {
          message = "Post updated successfully"
        }
        else {
          message = "Post added successfully"
        }
        response.status(200).json({
              status: true,
              message: message
        })
      }
      })
      .catch((err) => {
        //console.log("errr---", err) //comment later
        return response.status(400).json({
          status: false,
          message: err
        })
      })
      
    }

    @Get('getBeehivePosts')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'categoryId', required: false, type: Array })
    @ApiQuery({ name: 'dates', required: false, type: String })
    async getPost(@Res() response: Response,@Request() req,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: [],
    @Query('dates') dates?: string,
    ) {

      let filters = {
        search: search,
        categoryId: categoryId,
        dates: dates
      } 


      try {
        let post = await this.BeehivePostService.findAll(filters,req.user.userId)
        return response.status(200).json({
          status: true,
          message: "All Posts",
          data: post
        })
      }
      catch(err) {
        //console.log("err", err)
        response.status(400).json({
          status: false,
          message: err
        })
      }
        
    }

    @Get('mySavedPosts') 
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard('jwt'))
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'categoryId', required: false, type: Array })
    @ApiQuery({ name: 'dates', required: false, type: String })
    async savedPosts(@Res() response: Response,@Request() req,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: [],
    @Query('dates') dates?: string,) {

      let filters = {
        search: search,
        categoryId: categoryId,
        dates: dates
      } 

      try {
        let post = await this.BeehivePostService.getSavedBeehivePosts(filters,req.user.userId)
        return response.status(200).json({
          status: true,
          message: "All Posts",
          data: post
        })
      }
      catch(err) {
        //console.log("err", err)
        response.status(400).json({
          status: false,
          message: err
        })
      }
    }

    @Get('viewPost/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async viewPost(@Param('id') id: number,@Res() response: Response) {
      let PostDetails = await this.BeehivePostService.findPost(id)
      return response.status(200).json({
        status: true,
        message: "Post details",
        data: PostDetails
      })
  }

  @Get('myPosts') 
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'categoryId', required: false, type: Array })
  @ApiQuery({ name: 'dates', required: false, type: String })
  async myPosts(@Res() response: Response,@Request() req,
  @Query('categoryId') categoryId?: [],
  @Query('dates') dates?: string,) {

    let filters = {
      categoryId: categoryId,
      dates: dates
    } 

    try {
      let post = await this.BeehivePostService.findMyPosts(filters,req.user.userId)
      return response.status(200).json({
        status: true,
        message: "All Posts",
        data: post
      })
    }
    catch(err) {
      //console.log("err", err)
      response.status(400).json({
        status: false,
        message: err
      })
    }
  }

  // @Get('myPosts')
  // @ApiBearerAuth('JWT-auth')
  // @UseGuards(AuthGuard('jwt'))
  // async myPosts(@Res() response: Response,@Request() req) {
  //   let post = await this.BeehivePostService.findMyPosts(req.user.userId)
  //     return response.status(200).json({
  //       status: true,
  //       message: "All Posts",
  //       data: post
  //     })
  // }

  @Post('saveOrLikePost')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {type: 'number'},
        type: {type: 'string'},
        action: {type: 'boolean'}
      },
    }
  })
  async saveOrLikePost(@Res() response: Response,@Request() req) {
    //console.log(req.body, typeof req.body.type)
    try {
    let savePost = await this.BeehivePostService.likeBeehivePost(req.body.id,req.user.userId,req.body.type,req.body.action)
      if(savePost) {
         response.status(200).json({
          status: true,
          message: "Post has been liked/saved."
         })
      }
      else {
        response.status(400).json({
          status: false,
          message: "Error updating actionType"
         })
      }
  }
    catch(err) {
     // console.log("err", err)
      response.status(400).json({
        status: false,
        message: err
       })
    }
  }

  @Post('deleteFile')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  async deleteFile(@Body() deleteFileDto: deleteFileDto,@Res() response: Response,@Request() req) {
      //let deleteFile = await this.FileUploadService.deleteImageFromS3(deleteFileDto.fileId)
      try {
       let getFileDetails;

       if(deleteFileDto.postType === "Beehive") {
        getFileDetails = await this.BeehivePostMediaRepository.findOne({where: {id: deleteFileDto.fileId}})
       }
       else {
        getFileDetails = await this.BroadcastPostMediaRepository.findOne({where: {id: deleteFileDto.fileId}})
       }

       let deleteFile = await this.FileUploadService.deleteImageFromS3(getFileDetails.media_path)
       if(deleteFile) {
        if(deleteFileDto.postType === "Beehive") {
          let removeFile = await this.BeehivePostMediaRepository.delete(deleteFileDto.fileId);
          response.status(200).json({
            status: true,
            message: 'File deleted'
           })
         }
         else {
          let removeFile = await this.BroadcastPostMediaRepository.delete(deleteFileDto.fileId);
          response.status(200).json({
            status: true,
            message: 'File deleted'
           })
         }
       }
       else {
        response.status(400).json({
          status: false,
          message: 'Error updating Profile Picture'
         })
       }
      }
      catch(err) {
        //console.log("err", err)
        response.status(400).json({
          status: false,
          message: err
         })
      }
  }


}