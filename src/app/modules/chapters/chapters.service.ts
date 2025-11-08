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
    const chapters = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .leftJoin('lectures', 'lecture', 'lecture.chapter_id = chapter.id')
      .select([
        'chapter',
        'course.id',
        'course.name',
        'lecture.id',
        'lecture.name',
        'lecture.duration',
        'lecture.is_preview',
        'lecture.order_index',
        'lecture.file_url',
      ])
      .where('chapter.course_id = :courseId', { courseId })
      .getRawAndEntities();

    const result = chapters.entities.map((chapter) => {
      const lecturesForChapter = chapters.raw
        .filter((raw) => raw.chapter_id === chapter.id && raw.lecture_id !== null)
        .map((raw) => ({
          id: raw.lecture_id,
          name: raw.lecture_name,
          duration: raw.lecture_duration,
          isPreview: raw.is_preview,
          orderIndex: raw.order_index,
          fileUrl: raw.is_preview ? raw.file_url : null,
        }));

      return {
        ...chapter,
        lecture: lecturesForChapter,
      };
    });

    return result as Chapter[];
  }

  async findOne(id: string): Promise<Chapter> {
    const chapter = await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.course', 'course')
      .select(['chapter', 'course.id', 'course.name'])
      .where('chapter.id = :id', { id })
      .getOne();
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
