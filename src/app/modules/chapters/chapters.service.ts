import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Repository } from 'typeorm';
import { Course } from 'src/app/entities/course.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter) private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Course) private readonly courseRepository: Repository<Course>,
  ) {}

  private async validateCourse(courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new BadRequestException(`Course with ID ${courseId} not found`);
    }
  }

  async create(createChapterDto: CreateChapterDto, userId: string): Promise<Chapter> {
    await this.validateCourse(createChapterDto.courseId);

    const chapter = this.chapterRepository.create({
      ...createChapterDto,
      createdBy: userId,
    });
    return await this.chapterRepository.save(chapter);
  }

  async findAllChapterOfCourse(courseId: string): Promise<Chapter[]> {
    const chapters = await this.chapterRepository.find({ where: { courseId } });
    return chapters;
  }

  async findOne(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({ where: { id } });
    if (!chapter) {
      throw new BadRequestException('Chapter not found');
    }
    return chapter;
  }

  async update(id: string, updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    const chapter = await this.findOne(id);
    return await this.chapterRepository.save({ ...chapter, ...updateChapterDto });
  }

  async remove(id: string): Promise<void> {
    await this.chapterRepository.softDelete(id);
  }
}
