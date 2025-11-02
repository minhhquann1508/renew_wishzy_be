import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilter } from 'src/app/shared/utils/filter-utils';
import { UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createNewUserByAdmin(createUserDto);
    return {
      message: 'User created successfully',
      ...user,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: any) {
    const filters: UserFilter = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      fullName: query.fullName,
      email: query.email,
      role: query.role,
    };
    const result = await this.usersService.findAll(filters);

    return {
      message: 'Courses retrieved successfully',
      data: result,
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
