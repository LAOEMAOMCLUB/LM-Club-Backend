import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Res, Request, Query, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import {
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiConsumes,
    ApiBody,
    ApiBearerAuth,
  } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';

import { HasRoles } from '../auth/has-roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { NotificationService } from './notification.service';

  @ApiTags('notifications')
  @Controller('notifications')
  export class NotificationController {
    constructor(

        private readonly NotificationService: NotificationService

        // @InjectRepository(UserSubscription)
        // private UserSubscriptionRepository: Repository<UserSubscription>,
        
        
    ) 
      {}

      @Get('/getUserNotifications')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      async getUserNotifications(@Res() response: Response,@Request() req) {
        try {
         let allNotifications = await this.NotificationService.getNotifications(req.user.userId)
         response.status(200).json({
            status: true,
            message: "All notifications",
            data: allNotifications
         })
        }
        catch(err) {
            response.status(400).json({
                status: false,
                message: err
             })
        }
      }
      
      @Get('/readAllNotifications')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      async readAllNotifications(@Res() response: Response,@Request() req) {
        try {
            let viewAllNotifications = await this.NotificationService.readAllNotifications(req.user.userId)
            response.status(200).json({
               status: true,
               message: "All notifications read"
            })
           }
           catch(err) {
               response.status(400).json({
                   status: false,
                   message: err
                })
           }
      }

      @Get('/markAllAsRead')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      async markAllAsRead(@Res() response: Response,@Request() req) {
        try {
            let viewAllNotifications = await this.NotificationService.markAllAsReadNotifications(req.user.userId)
            response.status(200).json({
               status: true,
               message: "All notifications marked as read"
            })
           }
           catch(err) {
               response.status(400).json({
                   status: false,
                   message: err
                })
           }
      }

      @Get('/viewNotification/:id')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      async viewNotification(@Param('id') id: number,@Res() response: Response,@Request() req) {
        try {
            let viewNotification = await this.NotificationService.viewNotification(id)
            response.status(200).json({
               status: true,
               message: "Notifications viewed"
            })
           }
           catch(err) {
               response.status(400).json({
                   status: false,
                   message: err
                })
           }
      }


      @Get('/deleteNotification/:id')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      async deleteNotification(@Param('id') id: number,@Res() response: Response,@Request() req) {
        try {
            let viewNotification = await this.NotificationService.deleteNotification(id)
            response.status(200).json({
               status: true,
               message: "Notification deleted"
            })
           }
           catch(err) {
               response.status(400).json({
                   status: false,
                   message: err
                })
           }
      }

      @Get('/getAllUserNotifications')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      async getAllUserNotifications(@Res() response: Response,@Request() req) {
        try {
         let allNotifications = await this.NotificationService.getUserNotifications(req.user.userId)
         response.status(200).json({
            status: true,
            message: "All notifications",
            data: allNotifications
         })
        }
        catch(err) {
            response.status(400).json({
                status: false,
                message: err
             })
        }
      }

      @Post('/readOrDeleteNotifications')
      @ApiBearerAuth('JWT-auth')
      @UseGuards(AuthGuard('jwt'))
      @UsePipes(ValidationPipe)
      @ApiConsumes('application/json')
      @ApiBody({
        schema: {
          type: 'object',
            properties: {
              widgetId: {type: "number"},
              actionType: {type: "string"},
              ids: { type: "array", items: { type: "number" } }
            },
        }
      })
      async readOrDeleteNotifications(@Res() response: Response,@Request() req) {
        req.body.userId = req.user.userId
        try {
         let readOrDeleteNotifications = await this.NotificationService.readOrDeleteNotifications(req.body)
         response.status(200).json({
            status: true,
            message: "Read or deleted notifications"
         })
        }
        catch(err) {
            response.status(400).json({
                status: false,
                message: err
             })
        }
      }
 
  }