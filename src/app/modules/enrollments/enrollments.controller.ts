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
    const enrollments = await this.enrollmentsService.findAllEnrollmentOfUser(userId);
    return {
      message: 'Enrollments retrieved successfully',
      ...enrollments,
    };
  }

  @Get('my-enrollments')
  async getMyEnrollments(@CurrentUser() user: User) {
    const enrollments = await this.enrollmentsService.findAllEnrollmentOfUser(user.id);
    return {
      message: 'Your enrollments retrieved successfully',
      ...enrollments,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const enrollment = await this.enrollmentsService.findOne(id);
    return {
      message: 'Enrollment retrieved successfully',
      ...enrollment,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.enrollmentsService.update(id, updateEnrollmentDto);
    return {
      message: 'Enrollment updated successfully',
      ...enrollment,
    };
  }
}
