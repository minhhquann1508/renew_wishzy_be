import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('enrollments')
@ApiTags('Enrollments')
@ApiBearerAuth('bearer')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  async findAllEnrollmentOfUser(@Param('userId') userId: string) {
    return this.enrollmentsService.findAllEnrollmentOfUser(userId);
  }

  @Get('my-enrollments')
  async getMyEnrollments(@CurrentUser() user: User) {
    return this.enrollmentsService.findAllEnrollmentOfUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }
}
