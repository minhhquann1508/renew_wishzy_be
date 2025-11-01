import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'src/app/entities/course.entity';

@Injectable()
export class CourseOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = request.params.id;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!courseId) {
      throw new BadRequestException('Course ID is required');
    }

    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new BadRequestException(`Course with ID ${courseId} not found`);
    }

    if (course.createdBy !== user.id) {
      throw new ForbiddenException('You are not authorized to perform this action on this course');
    }

    request.course = course;

    return true;
  }
}
