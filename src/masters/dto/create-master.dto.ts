import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";


// export class addSubscriptionDto {

//     @ApiProperty({ example: 'New Plan Title'})
//     @IsString()
//     @IsNotEmpty({
//       message: 'Plan Title is required',
//     })
//     planTitle: string;

//     @ApiProperty({ example: 50})
//     //@IsNumber()
//     @IsNotEmpty({
//       message: 'Monthly Amount is required',
//     })
//     monthlyAmount: number;

//     @ApiProperty({ example: "New plan with exciting benefits"})
//     @IsOptional()
//     description: String;

//     @ApiProperty({ example: '1,2'})
//     @IsString()
//     @IsNotEmpty({
//       message: 'widgets are required',
//     })
//     widgets: string;

//     // @ApiProperty({ example: 'uploads/YourPlan/imageName'})
//     // @IsString()
//     // @IsNotEmpty({
//     //   message: 'logo path is required',
//     // })
//     // logo: string;

//     @ApiProperty({ type: 'string', format: 'binary' })
//     logo: any;
  
//   }

  export class updateSubscriptionDto {

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;

    @ApiProperty({ example: 'New Plan Title'})
    @IsOptional()
    planTitle: string;

    @ApiProperty({ example: 50})
    @IsOptional()
    monthlyAmount: number;

    @ApiProperty({ example: "description for plan"})
    @IsOptional()
    description: String;

    @ApiProperty({ example: '1,2'})
    @IsOptional()
    addWidgets: string;

    @ApiProperty({ example: '3,4'})
    @IsOptional()
    removeWidgets: string;

    @ApiProperty({ example: 'uploads/YourPlan/imageName'})
    @IsOptional()
    logo: string;

    // @ApiProperty({ type: 'string', format: 'binary' })
    // @IsOptional()
    // logo: any;

  }

  export class addWidgetDto {
    @ApiProperty({ example: 'New Widget Title'})
    @IsString()
    @IsNotEmpty({
      message: 'widget name is required',
    })
    widget_name: string;

    @ApiProperty({ example: 'widget description'})
    @IsOptional()
    description: string;

    @ApiProperty({ example: 'uploads/YourWidget/imageName'})
    @IsString()
    @IsNotEmpty({
      message: 'logo path is required',
    })
    logo: string;

    // @ApiProperty({ type: 'string', format: 'binary' })
    // logo: any;

  }

  export class updateWidgetDto {
    @ApiProperty({ example: 'New widget Title'})
    @IsOptional()
    widget_name: string;

    @ApiProperty({ example: 'widget description'})
    @IsOptional()
    description: string;

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;

    @ApiProperty({ example: 'uploads/YourWidget/imageName'})
    @IsOptional()
    logo: string;

    // @ApiProperty({ type: 'string', format: 'binary' })
    // @IsOptional()
    // logo: any;

  }

  export class addSettingDto {
    @ApiProperty({ example: 'New flag'})
    @IsString()
    @IsNotEmpty({
      message: 'flag is required',
    })
    flag: string;

    @ApiProperty({ example: 'New key'})
    @IsString()
    @IsNotEmpty({
      message: 'key is required',
    })
    key: string;

    @ApiProperty({ example: 'setting description'})
    @IsString()
    @IsNotEmpty({
      message: 'description is required',
    })
    description: string;

  }

  export class updateSettingDto {
    @ApiProperty({ example: 'New flag'})
    @IsOptional()
    flag: string;

    @ApiProperty({ example: 'New key'})
    @IsOptional()
    key: string;

    @ApiProperty({ example: 'setting description'})
    @IsOptional()
    description: string;

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;

  }


  export class updateEmailTemplateDto {
    @ApiProperty({ example: 'updated name'})
    @IsOptional()
    name: string;

    @ApiProperty({ example: 'updated message'})
    @IsOptional()
    message: string;

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;
    
  }

  export class beehiveCategoryDto {
    @ApiProperty({ example: 'category name'})
    @IsOptional()
    category_name: string;

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;

    @ApiProperty({ example: 'description'})
    @IsOptional()
    description: string;
    
  }

  export class contentDto {
    @ApiProperty({ example: 'name'})
    @IsOptional()
    name: string;

    @ApiProperty({ example: "Content"})
    @IsOptional()
    content: boolean;

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;
    
  }

  export class pointsMasterDto {
    @ApiProperty({ example: 'reward type'})
    @IsOptional()
    reward_type: string;

    @ApiProperty({ example: 100})
    @IsOptional()
    points: number;

    @ApiProperty({ example: true})
    @IsOptional()
    is_active: boolean;

    @ApiProperty({ example: '2024-01-01'})
    @IsOptional()
    start_date: Date

    @ApiProperty({ example: '2024-01-31'})
    @IsOptional()
    end_date: Date
    
  }

