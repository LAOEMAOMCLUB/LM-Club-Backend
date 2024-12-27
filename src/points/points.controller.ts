import { Body, Controller, Get, Post, Res, UseGuards, Request } from "@nestjs/common";
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { HasRoles } from '../auth/has-roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from "@nestjs/passport";
import { PointsService } from "./points.service"

@ApiTags('points')
@Controller('points')
export class PointsController {
    constructor(private readonly PointsService: PointsService) {}

    
    
    @Get("/userPoints")
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard('jwt'))
    async UserPoints(@Res() response: Response,@Request() req) {
        try {
            let Points = await this.PointsService.myPoints(req.user.userId)
            response.status(200).json({
                status: true,
                message: "Your earned Points.",
                data: Points
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

    @Get("/myReferralCode")
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard('jwt'))
    async myReferralCode(@Res() response: Response,@Request() req) {
        try {
            let RefDetails = await this.PointsService.myReferralCode(req.user.userId)
            response.status(200).json({
                status: true,
                message: "My referal code details.",
                data: RefDetails
            })
        }
        catch(err) {
            console.log("err", err)
            response.status(400).json({
                status: false,
                message: err
            })
        }
    }
    


}