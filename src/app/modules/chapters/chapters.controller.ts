import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ChapterOwnershipGuard } from './guards/chapter-ownership.guard';

@Controller('chapters')
@ApiTags('Chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async create(@Body() createChapterDto: CreateChapterDto, @CurrentUser() user: User) {
    const chapter = await this.chaptersService.create(createChapterDto, user.id);
    return {
      message: 'Chapter created successfully',
      ...chapter,
    };
  }

  @Get('course/:courseId')
  @Public()
  async findAllChapterOfCourse(@Param('courseId') courseId: string) {
    const chapters = await this.chaptersService.findAllChapterOfCourse(courseId);
    return {
      message: 'Chapters retrieved successfully',
      items: chapters,
    };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const chapter = await this.chaptersService.findOne(id);
    return {
      message: 'Chapter retrieved successfully',
      ...chapter,
    };
  }

  @Patch(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(ChapterOwnershipGuard)
  async update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    const chapter = await this.chaptersService.update(id, updateChapterDto);
    return {
      message: 'Chapter updated successfully',
      ...chapter,
    };
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(ChapterOwnershipGuard)
  async remove(@Param('id') id: string) {
    await this.chaptersService.remove(id);
    return {
      message: 'Chapter deleted successfully',
    };
  }
}
