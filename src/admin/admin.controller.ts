import { Body, Controller, Get, Post, Res, UseGuards, Request } from "@nestjs/common";
import { AdminService } from "./admin.service"
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { actionOnPostDto } from "./dto/post-action.dto"
import { HasRoles } from '../auth/has-roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from "@nestjs/passport";
import { MiddlewareService } from "src/middleware/middleware.service";

@ApiTags('Admin')
@Controller('Admin')
export class AdminController {
    constructor(
        private readonly AdminService: AdminService,
        private readonly MiddlewareService:MiddlewareService
    ) {}

    
    
    @Get("/dashboard")
    @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async Dashboard(@Res() response: Response,@Request() req) {
        try {
            let Dashboard = await this.AdminService.adminDashboard()
            this.MiddlewareService.sendResponseTypewithUserData(response,true, 200, 'Admin Dashboard', Dashboard,null)
        }
        catch(err) {
            //console.log("err--", err)
             this.MiddlewareService.sendResponsewithMessage(response,false, 400, err,null);
        }
        
    }
    
    @Get("/getPosts")
    @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async GetPosts(@Res() response: Response) {
       try { 
        let getAllPosts = await this.AdminService.getAllPosts()
        let getBroadcastPosts = await this.AdminService.getBroadcastPosts()
        response.status(200).json({
            status: true,
            message: "All Posts",
            data: getAllPosts,
            data1: getBroadcastPosts
        })
    }
    catch(err) {
        //console.log("errr", err)
        this.MiddlewareService.sendResponsewithMessage(response,false, 400, err,null);
    }
    }


//   @HasRoles(Role.Admin)
//   @UseGuards(AuthGuard('jwt'), RolesGuard)
//   @Get('admin')
//   onlyAdmin(@Request() req) {
//     return req.user;
//   }

    @Post("/actionOnPost")
    @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async actionOnPost(@Body() actionOnPostDto: actionOnPostDto,@Res() response: Response,@Request() req) {
        try {
            actionOnPostDto["userId"] = req.user.userId
            let action = await this.AdminService.actionOnPost(actionOnPostDto)
                const actionMessage = actionOnPostDto.statusId === 3
                    ? 'Post has been approved successfully.'
                    : 'Post has been rejected successfully.';
                const status = action ? 200 : 400;
                const message = action ? actionMessage : 'Error updating post status.';
                this.MiddlewareService.sendResponsewithMessage(response, !!action, status, message, null);
        }
        catch(err) {
            //console.log("err", err)
             this.MiddlewareService.sendResponsewithMessage(response,false, 400, err,null);
        }
    }

    @Post("/updateUserActiveStatus")
    @ApiBearerAuth('JWT-auth')
    @HasRoles(Role.Admin)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiConsumes('application/json')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          userId: {type: "number"},
          activeStatus: {type: "boolean"}
        },
      }
    })
    async updateUserActiveStatus(@Res() response: Response,@Request() req) {
      try {
        let saveUserStatus = await this.AdminService.updateUserActiveStatus(req.body)
        if(saveUserStatus) {
            response.status(200).json({
                status: true,
                message: "User active status updated"
            })
        }
      }
      catch(err) {
        response.status(400).json({
            status: false,
            message: err
        })
      }
    }

}