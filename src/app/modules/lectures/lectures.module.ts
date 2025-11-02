import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from 'src/app/entities/lecture.entity';
import { Chapter } from 'src/app/entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lecture, Chapter])],
  controllers: [LecturesController],
  providers: [LecturesService],
})
export class LecturesModule {}
