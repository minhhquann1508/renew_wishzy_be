import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Chapter } from 'src/app/entities/chapter.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LecturesService {
  constructor(
    @InjectRepository(Lecture) private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(Chapter) private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(createLectureDto: CreateLectureDto, userId: string): Promise<Lecture> {
    const chapter = await this.chapterRepository.findOne({
      where: { id: createLectureDto.chapterId },
    });
    if (!chapter) {
      throw new BadRequestException(`Chapter with ID ${createLectureDto.chapterId} not found`);
    }

    const lecture = this.lectureRepository.create({ ...createLectureDto, createdBy: userId });
    return await this.lectureRepository.save(lecture);
  }

  async findAllLectureOfChapter(chapterId: string): Promise<Lecture[]> {
    const lectures = await this.lectureRepository.find({ where: { chapterId } });

    const validateLecture = lectures.map((lecture) => {
      if (!lecture.isPreview) {
        delete lecture.fileUrl;
      }

      return lecture;
    });

    return validateLecture;
  }

  async findOne(id: string): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne({ where: { id } });
    if (!lecture) {
      throw new BadRequestException(`Lecture with ID ${id} not found`);
    }
    return lecture;
  }

  async update(id: string, updateLectureDto: UpdateLectureDto): Promise<Lecture> {
    const lecture = await this.findOne(id);
    Object.assign(lecture, updateLectureDto);
    return await this.lectureRepository.save(lecture);
  }

  async remove(id: string): Promise<void> {
    const lecture = await this.findOne(id);
    await this.lectureRepository.softDelete(lecture);
  }
}
