import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/app/entities/course.entity';
import { Repository } from 'typeorm';
import { CourseFilter } from 'src/app/shared/utils/filter-utils';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}
  async create(createCourseDto: CreateCourseDto, userId: string): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    course.createdBy = userId;
    return await this.courseRepository.save(course);
  }

  async getAllCourseForUser(filter: CourseFilter): Promise<PaginationResponse<Course>> {
    const {
      page,
      limit,
      name,
      categoryId,
      createdBy,
      rating,
      courseLevel,
      minPrice,
      maxPrice,
      status,
    } = filter;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email'])
      .leftJoinAndSelect('course.chapters', 'chapter');

    if (name) {
      queryBuilder.andWhere('course.name LIKE :name', { name: `%${name}%` });
    }
    if (categoryId) {
      queryBuilder.andWhere('course.categoryId = :categoryId', { categoryId });
    }
    if (createdBy) {
      queryBuilder.andWhere('course.createdBy = :createdBy', { createdBy });
    }
    if (rating) {
      queryBuilder.andWhere('course.rating = :rating', { rating });
    }
    if (courseLevel) {
      queryBuilder.andWhere('course.courseLevel = :courseLevel', { courseLevel });
    }
    if (minPrice) {
      queryBuilder.andWhere('course.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('course.price <= :maxPrice', { maxPrice });
    }
    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    if (courseLevel) {
      queryBuilder.andWhere('course.courseLevel = :courseLevel', { courseLevel });
    }

    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);
    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      items: courses,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.creator', 'creator')
      .addSelect(['creator.id', 'creator.fullName', 'creator.email', 'creator.avatar'])
      .leftJoinAndSelect('course.chapters', 'chapter')
      .where('course.id = :id', { id })
      .getOne();

    if (!course) {
      throw new BadRequestException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async updateStatusOfCourse(id: string): Promise<void> {
    const course = await this.findOne(id);
    course.status = !course.status;
    await this.courseRepository.save(course);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    Object.assign(course, updateCourseDto);

    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    await this.courseRepository.softDelete(id);
  }
}
