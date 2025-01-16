import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {

  @ApiProperty({ example: 'email.com'})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'urPassword'})
  @IsNotEmpty()
  password: string;
}