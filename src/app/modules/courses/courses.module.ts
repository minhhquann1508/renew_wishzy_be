import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/app/entities/course.entity';
import { CourseOwnershipGuard } from './guards/course-ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  controllers: [CoursesController],
  providers: [CoursesService, CourseOwnershipGuard],
  exports: [CoursesService],
})
export class CoursesModule {}
