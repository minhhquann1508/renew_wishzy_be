import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FilterCourseDto } from './dto/filter-course.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CourseOwnershipGuard } from './guards/course-ownership.guard';

@ApiTags('Courses')
@ApiBearerAuth('bearer')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
    const course = await this.coursesService.create(createCourseDto, user.id);
    return {
      message: 'Course created successfully',
      ...course,
    };
  }

  @Get()
  @Public()
  async getAllCourseForUser(@Query() filterDto: FilterCourseDto) {
    const results = await this.coursesService.getAllCourseForUser(filterDto);

    return {
      message: 'Courses retrieved successfully',
      ...results,
    };
  }

  @Get('hot-course')
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  async getHotCourses(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const results = await this.coursesService.getHotCourses(page, limit);

    return {
      message: 'Hot courses retrieved successfully',
      ...results,
    };
  }

  @Get('instructor/my-courses')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  async getMyInstructorCourses(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const results = await this.coursesService.getInstructorCourses(user.id, page, limit);

    return {
      message: 'Instructor courses retrieved successfully',
      ...results,
    };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    return {
      message: 'Course retrieved successfully',
      ...course,
    };
  }

  @Put(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(CourseOwnershipGuard)
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return {
      message: 'Course updated successfully',
      ...course,
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(CourseOwnershipGuard)
  async updateStatusOfCourse(@Param('id') id: string) {
    await this.coursesService.updateStatusOfCourse(id);
    return {
      message: 'Course status updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(CourseOwnershipGuard)
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return {
      message: 'Course deleted successfully',
    };
  }
}
