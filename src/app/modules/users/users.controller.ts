import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createNewUserByAdmin(createUserDto);
    return {
      message: 'User created successfully',
      ...user,
    };
  }

  @Post('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new admin account' })
  @ApiResponse({ status: 201, description: 'Admin account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only admins can create admin accounts' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.usersService.createAdmin(createAdminDto);
    return {
      message: 'Admin account created successfully',
      user: admin,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() filterDto: FilterUserDto) {
    const result = await this.usersService.findAll(filterDto);

    return {
      message: 'Users retrieved successfully',
      data: result,
    };
  }

  @Get('instructors/list')
  @Public()
  @ApiOperation({ summary: 'Get list of instructors' })
  @ApiResponse({ status: 200, description: 'Instructors retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllInstructors(@Query() filterDto: FilterUserDto) {
    const result = await this.usersService.findAllInstructors(filterDto);

    return {
      message: 'Instructors retrieved successfully',
      data: result,
    };
  }

  @Get('instructors/my-students')
  @Roles(UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get students enrolled in instructor courses' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - User is not an instructor' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only instructors can access' })
  async getInstructorStudents(@CurrentUser() user: User, @Query() filterDto: FilterUserDto) {
    const result = await this.usersService.getInstructorStudents(user.id, filterDto);

    return {
      message: 'Students retrieved successfully',
      data: result,
    };
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user) {
    const profile = await this.usersService.findOne(user.id);
    return {
      message: 'Profile retrieved successfully',
      user: profile,
    };
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@CurrentUser() user, @Body() updateProfileDto: UpdateProfileDto) {
    const updatedProfile = await this.usersService.updateProfile(user.id, updateProfileDto);
    return {
      message: 'Profile updated successfully',
      user: updatedProfile,
    };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Current password is incorrect' })
  async changePassword(@CurrentUser() user, @Body() changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return {
      message: 'Password changed successfully',
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(id);
    return {
      message: 'User retrieved successfully',
      ...user,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      ...updatedUser,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
