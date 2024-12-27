import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

import Config from "./../../config/config"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email) {
    let User = await this.usersService.login(email)
    const payload = {
      username: User.user_name,
      mobile: User.mobile_number,
      email: User.email_id,
      userId: User.id,
      role: User.role.role,
    };
    return {
      access_token: this.jwtService.sign(payload,{ secret: Config.jwt.secretKey }), //process.env.JWT_SECRET_KEY // uat changes
    };
  }
}