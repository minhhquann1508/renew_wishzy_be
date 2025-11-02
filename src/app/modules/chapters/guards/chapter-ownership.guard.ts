import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from 'src/app/entities/chapter.entity';
import { BaseOwnershipGuard } from 'src/app/common/guards/ownership.guard';

@Injectable()
export class ChapterOwnershipGuard extends BaseOwnershipGuard<Chapter> {
  constructor(
    @InjectRepository(Chapter)
    chapterRepository: Repository<Chapter>,
  ) {
    super(chapterRepository, 'Chapter');
  }
}
