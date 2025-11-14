import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/app/entities/user.entity';
import { Enrollment } from 'src/app/entities/enrollment.entity';
import { Course } from 'src/app/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Enrollment, Course])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
