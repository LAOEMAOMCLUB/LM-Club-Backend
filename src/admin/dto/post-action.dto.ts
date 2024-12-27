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

  export class actionOnPostDto {
    @ApiProperty({ example: 1})
    @IsNumber()
    @IsNotEmpty({
      message: 'post id is required',
    })
    postId: number;

    @ApiProperty({ example: 1})
    @IsNumber()
    @IsNotEmpty({
      message: 'status id is required',
    })
    statusId: number;

    @ApiProperty({ example: "Beehive"})
    @IsNotEmpty({
      message: 'post Type is required',
    })
    postType: string;
  
  }