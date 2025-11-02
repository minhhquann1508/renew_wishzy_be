import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from 'src/app/entities/document.entity';
import { DocumentOwnershipGuard } from './guards/document-ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentOwnershipGuard],
})
export class DocumentsModule {}
