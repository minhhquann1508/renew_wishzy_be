import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  password!: string;
}
