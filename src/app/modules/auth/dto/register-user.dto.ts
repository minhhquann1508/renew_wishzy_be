import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
  })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName!: string;

  @ApiProperty({ description: 'Email of the user' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'Confirm password of the user' })
  @IsString()
  confirmPassword!: string;
}
