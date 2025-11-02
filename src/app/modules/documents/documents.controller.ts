import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { DocumentOwnershipGuard } from './guards/document-ownership.guard';

@Controller('documents')
@ApiTags('Documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async create(@Body() createDocumentDto: CreateDocumentDto, @CurrentUser() user: User) {
    const document = await this.documentsService.create(createDocumentDto, user.id);
    return {
      message: 'Document created successfully',
      ...document,
    };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('entityId') entityId?: string,
    @Query('entityType') entityType?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    const filters = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      name,
      entityId,
      entityType,
      createdBy,
    };

    const results = await this.documentsService.findAll(filters);

    return {
      message: 'Documents retrieved successfully',
      ...results,
    };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const document = await this.documentsService.findOne(id);
    return {
      message: 'Document retrieved successfully',
      ...document,
    };
  }

  @Patch(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(DocumentOwnershipGuard)
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    const document = await this.documentsService.update(id, updateDocumentDto);
    return {
      message: 'Document updated successfully',
      ...document,
    };
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseGuards(DocumentOwnershipGuard)
  async remove(@Param('id') id: string) {
    await this.documentsService.remove(id);
    return {
      message: 'Document deleted successfully',
    };
  }
}
