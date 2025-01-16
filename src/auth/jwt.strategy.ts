import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import Config from "./../../config/config"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: Config.jwt.secretKey 
        });
    }


    async validate(payload: any) {
        return {
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
        };
    }
}