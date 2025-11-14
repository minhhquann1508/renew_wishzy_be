import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from Google Sign-In (can be either idToken or credential)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
    required: false,
  })
  @IsOptional()
  @IsString()
  idToken?: string;

  @ApiProperty({
    description: 'Google credential from Google Sign-In button',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
    required: false,
  })
  @IsOptional()
  @IsString()
  credential?: string;
}
