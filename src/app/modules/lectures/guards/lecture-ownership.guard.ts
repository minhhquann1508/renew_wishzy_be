import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecture } from 'src/app/entities/lecture.entity';
import { BaseOwnershipGuard } from 'src/app/common/guards/ownership.guard';

@Injectable()
export class LectureOwnershipGuard extends BaseOwnershipGuard<Lecture> {
  constructor(
    @InjectRepository(Lecture)
    lectureRepository: Repository<Lecture>,
  ) {
    super(lectureRepository, 'Lecture');
  }
}
