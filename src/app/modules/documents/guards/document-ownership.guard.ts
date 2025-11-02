import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from 'src/app/entities/document.entity';
import { BaseOwnershipGuard } from 'src/app/common/guards/ownership.guard';

@Injectable()
export class DocumentOwnershipGuard extends BaseOwnershipGuard<Document> {
  constructor(
    @InjectRepository(Document)
    documentRepository: Repository<Document>,
  ) {
    super(documentRepository, 'Document');
  }
}
