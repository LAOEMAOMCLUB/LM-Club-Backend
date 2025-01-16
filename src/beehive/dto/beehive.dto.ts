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

  export class beehivePostDto {
    @ApiProperty({ example: '150.00'})
    @IsString()
    beehiveCategory: string;

    @ApiProperty({ example: "dfghjklkjhcvbkk"})
    @IsString()
    nonce: string;

    @ApiProperty({ example: 1})
    @IsNumber()
    userId: number;

    @ApiProperty({ example: 1})
    @IsNumber()
    planId: number;

    @ApiProperty({ example: 'yyyy-mm-dd'})
    @IsNotEmpty({
      message: 'subscription_from must be a Date',
    })
    subscription_from: Date;

    @ApiProperty({ example: 'yyyy-mm-dd'})
    @IsNotEmpty({
      message: 'subscription_upto must be a Date',
    })
    subscription_upto: Date;

    @ApiProperty({ example: 1234698745698745})
    @IsNumber()
    card_number: number;

    @ApiProperty({ example: "Vivek Santi"})
    @IsString()
    card_holder_name: string;
  
  }

  export class deleteFileDto {
    @ApiProperty({ example: 'Beehive/Broadcast'})
    @IsString()
    postType: string;

    @ApiProperty({ example: 0})
    @IsNumber()
    fileId: number;
  }