import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { User, LoginType } from '../../entities/user.entity';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  private sanitizeUser(user: User): User {
    delete user.password;
    delete user.verificationToken;
    delete user.verificationTokenExp;
    delete user.resetPasswordToken;
    delete user.resetPasswordExp;
    return user;
  }

  async register(registerUserDto: RegisterUserDto): Promise<void> {
    const { email, password, confirmPassword, fullName } = registerUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      if (!existingUser.verified) {
        throw new ConflictException(
          'Email already registered but not verified. Please check your email or request a new verification link.',
        );
      }
      throw new ConflictException('Email already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExp = new Date();
    verificationTokenExp.setHours(verificationTokenExp.getHours() + 24); // 24 hours expiry

    // Create user
    const user = this.userRepository.create({
      email,
      fullName,
      verificationToken,
      verificationTokenExp,
      verified: false,
    });

    user.setPassword(password);

    await this.userRepository.save(user);

    await this.mailService.sendVerificationEmail(email, verificationToken, fullName);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.verificationToken', 'user.verificationTokenExp'])
      .where('user.verificationToken = :token', { token })
      .getOne();

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (user.verificationTokenExp && user.verificationTokenExp < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Update user as verified
    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExp = null;

    await this.userRepository.save(user);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExp = new Date();
    verificationTokenExp.setHours(verificationTokenExp.getHours() + 24);

    user.verificationToken = verificationToken;
    user.verificationTokenExp = verificationTokenExp;

    await this.userRepository.save(user);

    // Send verification email
    await this.mailService.sendVerificationEmail(email, verificationToken, user.fullName);
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;

    // Select password for validation
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verified) {
      throw new BadRequestException(
        'Email not verified. Please check your email to verify your account.',
      );
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.sanitizeUser(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date();
    resetTokenExp.setHours(resetTokenExp.getHours() + 24);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExp = resetTokenExp;

    await this.userRepository.save(user);

    await this.mailService.sendPasswordResetEmail(email, resetToken, user.fullName);
  }

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });
  }

  generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
    });
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    resetPasswordToken: string,
  ): Promise<void> {
    const { password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.resetPasswordToken', 'user.resetPasswordExp'])
      .where('user.resetPasswordToken = :resetPasswordToken', { resetPasswordToken })
      .getOne();

    if (!user) {
      throw new NotFoundException('Invalid reset token');
    }

    if (user.resetPasswordExp && user.resetPasswordExp < new Date()) {
      throw new BadRequestException('Reset password token has expired');
    }

    user.setPassword(password);

    user.resetPasswordToken = null;
    user.resetPasswordExp = null;

    await this.userRepository.save(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find user by ID from token payload
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.verified) {
        throw new UnauthorizedException('Email not verified');
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile() {}

  async googleAuth(idToken: string): Promise<User> {
    try {
      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      const { email, name, picture } = payload;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      // Check if user exists
      let user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        // User exists - update login type if needed
        if (user.loginType !== LoginType.GOOGLE) {
          user.loginType = LoginType.GOOGLE;
          await this.userRepository.save(user);
        }
      } else {
        // Create new user with Google account
        user = this.userRepository.create({
          email,
          fullName: name || email.split('@')[0],
          avatar: picture,
          loginType: LoginType.GOOGLE,
          verified: true, // Google accounts are pre-verified
        });

        await this.userRepository.save(user);
      }

      return this.sanitizeUser(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }
}
