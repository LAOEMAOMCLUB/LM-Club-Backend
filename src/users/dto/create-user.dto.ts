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
  
  export class CreateUserDto {

    @ApiProperty({ example: 'user name'})
    @IsNotEmpty({
      message: 'Username is required',
    })
    username: string; //user_name
  
    @ApiProperty({ example: 'email.com'})
    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;  //email_id
  
    @ApiProperty({ example: 'urPassword'})
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message: 'Password too weak. It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    password: string;

    @ApiProperty({ example: '789-78946-456'})
    @IsString()
    @IsNotEmpty({
      message: 'Mobile number is required',
    })
    mobile: string;  //mobile_number

    @ApiProperty({ example: 'Goldenville'})
    @IsString()
    @IsNotEmpty({
      message: 'street number is required',
    })
    street: string;

    @ApiProperty({ example: 1})
    @IsNumber()
    @IsNotEmpty({
      message: 'city is required',
    })
    city: number;

    @ApiProperty({ example: 1})
    @IsNumber()
    @IsNotEmpty({
      message: 'state is required',
    })
    state: number;

    @ApiProperty({ example: '78965'})
    @IsString()
    @IsNotEmpty({
      message: 'zipcode is required',
    })
    zipcode?: string;

    //@ApiProperty({ example: 'REFERALCODE'})
    @IsOptional()
    @IsString()
    referalCode?: string;  //referal_code_applied

    @IsOptional()
    @IsNumber()
    planId?: number;

    // @ApiProperty({ example: 'yyyy-mm-dd'})
    // @IsNotEmpty({
    //   message: 'subscription_from must be a Date',
    // })
    // subscription_from: Date;

    // @ApiProperty({ example: 'yyyy-mm-dd'})
    // @IsNotEmpty({
    //   message: 'subscription_upto must be a Date',
    // })
    // subscription_upto: Date;

  }

  export class UserSubcriptionDto {
    @ApiProperty({ example: '78965'})
    @IsNotEmpty({
      message: 'userId is required',
    })
    @IsNumber()
    user_id: number;
  
    @ApiProperty({ example: '78965'})
    @IsNotEmpty({
      message: 'subscription id must be a number',
    })
    @IsNumber()
    subscription_id: number;

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
    //user: number;


  
  }

  export class UserWidgetDto {
    @IsNotEmpty({
      message: 'userId is required',
    })
    @IsNumber()
    userId: number;
  
    @IsNotEmpty({
      message: 'widgetId must be a number',
    })
    @IsNumber()
    widgetId: number;
  
  }

  export class UserOtpDto {
    @ApiProperty({ example: '789-78946-456'})
    @IsOptional()
    @IsString()
    @IsNotEmpty({
      message: 'Mobile number is required',
    })
    mobile: string;
  
    @ApiProperty({ example: 1234})
    @IsNotEmpty({
      message: 'Otp must be a number',
    })
    @IsNumber()
    otp: number;

    @ApiProperty({ example: 1})
    @IsOptional()
    planId: number;

    @ApiProperty({ example: 1})
    @IsOptional()
    userSubscriptionId: number;

    @ApiProperty({ example: 'admin1@yopmail.com'})
    @IsOptional()
    email: string;
  
  }


  export class forgotPasswordDto {
    @ApiProperty({ example: '789-78946-456'})
    @IsOptional()
    @IsString()
    @IsNotEmpty({
      message: 'Mobile number is required',
    })
    mobile: string;

    @ApiProperty({ example: 'admin1@yopmail.com'})
    @IsOptional()
    email: string;
  
  }

  export class updateImageDto {
    @ApiProperty({ example: 1})
    @IsNumber()
    @IsNotEmpty({
      message: 'Mobile number is required',
    })
    userId: number;
  
  }

  export class resetPasswordDto {

    @ApiProperty({ example: '789-78946-456'})
    @IsOptional()
    @IsString()
    @IsNotEmpty({
      message: 'Mobile number is required',
    })
    mobile: string;

    @ApiProperty({ example: 'admin1@yopmail.com'})
    @IsOptional()
    email: string;

    @ApiProperty({ example: 'urPassword'})
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message: 'your new Password is too weak. It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    newPassword: string;

    @ApiProperty({ example: 'urPassword'})
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message: 'your confirm Password is too weak. It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    confirmPassword: string;
  
  }

  export class changePasswordDto {

    @ApiProperty({ example: 'Vivek@123'})
    @IsString()
    @IsNotEmpty({
      message: 'Old Password is required',
    })
    oldPassword: string;

    @ApiProperty({ example: 'V-wake@123'})
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message: 'your new Password is too weak. It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    newPassword: string;

    @ApiProperty({ example: 'V-wake@123'})
    @IsString()
    @MinLength(6)
    @MaxLength(10)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
      message: 'your confirm Password is too weak. It must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    })
    confirmPassword: string;
  
  }

  export class UpdateProfileDto {

    @ApiProperty({ example: 'user name'})
    @IsOptional()
    user_name: string; 

    @ApiProperty({ example: 'Goldenville'})
    @IsOptional()
    street: string;

    @ApiProperty({ example: 1})
    @IsOptional()
    city: number;

    @ApiProperty({ example: 1})
    @IsOptional()
    state: number;

    @ApiProperty({ example: '78965'})
    @IsOptional()
    zipcode: string;

    // @ApiProperty({ example: 'uploads/userprofile/userId/imageName'})
    // @IsOptional()
    // image_path: string;

    @ApiProperty({ example: 'business person name'})
    @IsOptional()
    business_person_name: string; 

    @ApiProperty({ example: 'Vivek'})
    @IsOptional()
    business_by: string;

    @ApiProperty({ example: '2020-01-01'})
    @IsOptional()
    business_established_date: string; 

    @ApiProperty({ example: 'Type of Business'})
    @IsOptional()
    type_of_business: string;
    
    @ApiProperty({ example: 'Type of service'})
    @IsOptional()
    services_offered: string;

    @ApiProperty({ example: 'Santi city'})
    @IsOptional()
    location: string;

    @ApiProperty({ example: '09:00:00'})
    @IsOptional()
    operation_hours_from: string;

    @ApiProperty({ example: '18:00:00'})
    @IsOptional()
    operation_hours_to: string;
    
    
  }

  export class gAUrlDto {
    @ApiProperty({ example: 'uploads/yourSpecificFolder/imageName'})
    @IsString()
    @IsNotEmpty({
      message: 'image path is required',
    })
    imagePath: string;
  
  }