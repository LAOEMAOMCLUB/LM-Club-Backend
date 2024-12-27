import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    IsNumber,
     IsDate,
     IsOptional,
     IsEmail
  } from 'class-validator';

  export class broadcastPostShareDto {
    @ApiProperty({ example: '150.00'})
    @IsString()
    mode_of_share: string;

    @ApiProperty({ example: 1})
    @IsNumber()
    postId: number;
  
  }