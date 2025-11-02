import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'src/app/entities/course.entity';
import { BaseOwnershipGuard } from 'src/app/common/guards/ownership.guard';

@Injectable()
export class CourseOwnershipGuard extends BaseOwnershipGuard<Course> {
  constructor(
    @InjectRepository(Course)
    courseRepository: Repository<Course>,
  ) {
    super(courseRepository, 'Course');
  }
}
