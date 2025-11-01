import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  password!: string;
}
