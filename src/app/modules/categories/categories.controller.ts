import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/app/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CategoryFilter } from 'src/app/shared/utils/filter-utils';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN) // Chỉ admin được tạo category
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);

    return {
      message: 'Category created successfully',
      ...category,
    };
  }

  @Get()
  @Public() // Public route - không cần authentication
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('parentId') parentId?: string,
    @Query('isSubCategory') isSubCategory?: string,
  ) {
    const filter: CategoryFilter = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      name,
      parentId,
      isSubCategory:
        isSubCategory === 'true' ? true : isSubCategory === 'false' ? false : undefined,
    };

    const result = await this.categoriesService.findAll(filter);

    return {
      message: 'Categories retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findById(id);
    return {
      message: 'Category retrieved successfully',
      ...category,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN) // Chỉ admin được update
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // Chỉ admin được xóa (soft delete)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return {
      message: 'Category deleted successfully',
    };
  }

  @Put(':id/restore')
  @Roles(UserRole.ADMIN) // Chỉ admin được restore
  async restore(@Param('id') id: string) {
    const category = await this.categoriesService.restore(id);
    return {
      message: 'Category restored successfully',
      ...category,
    };
  }

  @Delete(':id/hard')
  @Roles(UserRole.ADMIN) // Chỉ admin được xóa vĩnh viễn
  async hardDelete(@Param('id') id: string) {
    await this.categoriesService.hardDelete(id);
    return {
      message: 'Category permanently deleted',
    };
  }
}
