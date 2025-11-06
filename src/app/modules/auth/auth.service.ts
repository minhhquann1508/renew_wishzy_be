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
import { User } from '../../entities/user.entity';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
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

    await this.mailService.sendResetPasswordEmail(email, resetToken, user.fullName);
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
}
