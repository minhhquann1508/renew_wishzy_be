import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { LectureOwnershipGuard } from './guards/lecture-ownership.guard';

@Controller('lectures')
@ApiTags('Lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async create(@Body() createLectureDto: CreateLectureDto, @CurrentUser() user: User) {
    const lecture = await this.lecturesService.create(createLectureDto, user.id);
    return {
      message: 'Lecture created successfully',
      ...lecture,
    };
  }

  @Get(':chapterId/chapter')
  @Public()
  async findAllLectureOfChapter(@Param('chapterId') chapterId: string) {
    const lectures = await this.lecturesService.findAllLectureOfChapter(chapterId);
    return {
      message: 'Lectures retrieved successfully',
      ...lectures,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lecture = await this.lecturesService.findOne(id);
    return {
      message: 'Lecture retrieved successfully',
      ...lecture,
    };
  }

  @Put(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(LectureOwnershipGuard)
  async update(@Param('id') id: string, @Body() updateLectureDto: UpdateLectureDto) {
    const lecture = await this.lecturesService.update(id, updateLectureDto);

    return {
      message: 'Lecture updated successfully',
      ...lecture,
    };
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(LectureOwnershipGuard)
  async remove(@Param('id') id: string) {
    await this.lecturesService.remove(id);
    return {
      message: 'Lecture deleted successfully',
    };
  }
}
