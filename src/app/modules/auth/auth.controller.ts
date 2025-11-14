import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Res,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';
import { UsersService } from '../users/users.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Verification email sent.',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Passwords do not match' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    await this.authService.register(registerUserDto);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email with token' })
  @ApiQuery({ name: 'token', description: 'Email verification token', required: true })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Token expired' })
  @ApiResponse({ status: 404, description: 'Not found - Invalid token' })
  async verifyEmail(@Query('token') token: string) {
    await this.authService.verifyEmail(token);
    return {
      message: 'Email verified successfully. You can now login.',
    };
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already verified' })
  @ApiResponse({ status: 404, description: 'Not found - User not found' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    await this.authService.resendVerificationEmail(resendVerificationDto.email);
    return {
      message: 'Verification email sent successfully',
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid credentials' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @ApiResponse({ status: 404, description: 'Not found - User not found' })
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.login(loginUserDto);
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      user,
      accessToken,
      message: 'Login successful',
    };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  @ApiResponse({ status: 404, description: 'Not found - User not found' })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  @Public()
  @Put('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiQuery({ name: 'token', description: 'Password reset token', required: true })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Passwords do not match or token expired',
  })
  @ApiResponse({ status: 404, description: 'Not found - Invalid token' })
  async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto, token);
    return {
      message: 'Password reset successfully. You can now login with your new password.',
    };
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token from cookie' })
  @ApiResponse({ status: 200, description: 'New access token generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token' })
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found in cookies');
    }

    return this.authService.refreshToken({ refreshToken });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired access token' })
  async getProfile(@CurrentUser() user: User) {
    return this.userService.findOne(user.id);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return {
      message: 'Logout successful',
    };
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login or register with Google' })
  @ApiResponse({ status: 200, description: 'Google authentication successful' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid Google token' })
  async googleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Accept both idToken and credential field names
    const token = googleAuthDto.idToken || googleAuthDto.credential;

    if (!token) {
      throw new BadRequestException('Google token is required (idToken or credential)');
    }

    const user = await this.authService.googleAuth(token);
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      user,
      accessToken,
      message: 'Google authentication successful',
    };
  }
}
