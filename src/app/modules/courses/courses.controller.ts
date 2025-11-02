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
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CourseFilter } from 'src/app/shared/utils/filter-utils';
import { CourseOwnershipGuard } from './guards/course-ownership.guard';
import { CourseLevel } from 'src/app/entities/enums/course.enum';

@ApiTags('Courses')
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
  async getAllCourseForUser(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('createdBy') createdBy?: string,
    @Query('rating') rating?: string,
    @Query('courseLevel') courseLevel?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: string,
  ) {
    const filter: CourseFilter = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      name,
      categoryId,
      createdBy,
      rating: rating ? Number(rating) : undefined,
      courseLevel: courseLevel ? CourseLevel[courseLevel] : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      status,
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
