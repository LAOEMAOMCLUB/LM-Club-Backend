// controller.ts

import { Controller, Get, Post, Res, UploadedFile, UseGuards, UseInterceptors, Request, Query, Param, UploadedFiles, Body } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { HasRoles } from '../auth/has-roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { broadcastPostShareDto } from "./dto/broadcast.dto"


@ApiTags('broadcastPost')
@Controller()
export class BroadcastController {
  constructor(private readonly BroadcastService: BroadcastService) {}

  @Post('uploadBroadcastPost')
  @ApiBearerAuth('JWT-auth')
  @HasRoles(Role.BusinessUser)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      what_are_you_promoting: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      is_draft: { type: 'boolean' },
      is_edited: { type: 'boolean' },
      coupon_code: { type: 'string' },
      valid_from: { type: 'string' },
      post_duration: { type: 'string' },
      id: { type: 'integer' },
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
async uploadBeehivePost(@UploadedFiles() files: Express.Multer.File[],@Res() response: Response, @Request() req) { //@UploadedFile() file: Express.Multer.File
  req.body.userId = req.user.userId

  if(files) {
    req.body.file = files
  }
//   console.log("payloadFiles---",file)
   //console.log("req", req.body.file)  //comment later
  await this.BroadcastService.uploadPost(req.body).then((post) => {
       if(post) {
        //console.log("post", post)
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
  else {
   // console.log("errr---") //comment later
    return response.status(400).json({
      status: false,
      message: "Error adding post"
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


@Get('getBroadcastPosts')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@ApiQuery({ name: 'search', required: false, type: String })
//@ApiQuery({ name: 'categoryId', required: false, type: Array })
@ApiQuery({ name: 'dates', required: false, type: String })
async getPost(@Res() response: Response,@Request() req,
@Query('search') search?: string,
//@Query('categoryId') categoryId?: [],
@Query('dates') dates?: string,
) {

  let filters = {
    search: search,
    //categoryId: categoryId,
    dates: dates
  } 


  try {
    let post = await this.BroadcastService.findAll(filters,req.user.userId)
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
  try {
    let PostDetails = await this.BroadcastService.findPost(id)
    return response.status(200).json({
      status: true,
      message: "Post details",
      data: PostDetails
    })
  }
  catch(err) {
    //console.log("err", err)
    return response.status(400).json({
      status: false,
      message: err
    })
  }
    
}


@Get('myPosts') 
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  //@ApiQuery({ name: 'categoryId', required: false, type: Array })
  @ApiQuery({ name: 'dates', required: false, type: String })
  async myPosts(@Res() response: Response,@Request() req,
  //@Query('categoryId') categoryId?: [],
  @Query('dates') dates?: string,) {

    let filters = {
      dates: dates
    } 

    try {
      let post = await this.BroadcastService.findMyPosts(filters,req.user.userId)
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

  @Post("sharePost")
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       postId: { type: 'integer' },
  //       mode_of_share: { type: 'string' }
  //     },
  //   },
  // })
  async sharePost(@Body() broadcastPostShareDto: broadcastPostShareDto,@Res() response: Response, @Request() req) {
    try {
      broadcastPostShareDto["userId"] = req.user.userId
      let sharePost = await this.BroadcastService.shareBroadcastPost(broadcastPostShareDto)
      if(sharePost) {
        return response.status(200).json({
          status: true,
          message: "U have share the Post successfully"
        })
      }
      else {
        return response.status(400).json({
          status: false,
          message: "You have already shared the post on " + req.body.mode_of_share.split(" ")[0]
        })
      }
    }
    catch(err) {
      return response.status(400).json({
        status: 400,
        message: err
      })
    }
    

  }

  @Get('myShares') 
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  //@ApiQuery({ name: 'categoryId', required: false, type: Array })
  // @ApiQuery({ name: 'dates', required: false, type: String })
  async myShares(@Res() response: Response,@Request() req,
  //@Query('categoryId') categoryId?: [],
  //@Query('dates') dates?: string,
  ) {

    // let filters = {
    //   dates: dates
    // } 

    try {
      let post = await this.BroadcastService.myShares(req.user.userId)
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
}
