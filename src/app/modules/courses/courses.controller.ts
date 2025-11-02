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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/app/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CourseFilter } from 'src/app/shared/utils/filter-utils';
import { CourseOwnershipGuard } from './guards/course-ownership.guard';
import { CourseLevel } from 'src/app/entities/enums/course.enum';

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
  async getAllCourseForUser(@Query() query: any) {
    const filter: CourseFilter = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      name: query.name,
      categoryId: query.categoryId,
      createdBy: query.createdBy,
      rating: query.rating ? Number(query.rating) : undefined,
      courseLevel: query.courseLevel ? CourseLevel[query.courseLevel] : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      status: query.status,
    };

    const results = await this.coursesService.getAllCourseForUser(filter);

    return {
      message: 'Courses retrieved successfully',
      ...results,
    };
  }

  @Get(':id')
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
