import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/app/entities/category.entity';
import { CategoryFilter } from 'src/app/shared/utils/filter-utils';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    const result = await this.categoryRepository.save(category);
    return result;
  }

  async findAll(filter: CategoryFilter): Promise<PaginationResponse<Category>> {
    const { page = 1, limit = 10, name, parentId, isSubCategory } = filter;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    if (name) {
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${name}%` });
    }

    if (parentId) {
      queryBuilder.andWhere('category.parent_id = :parentId', { parentId: filter.parentId });
    }

    if (isSubCategory !== undefined) {
      if (isSubCategory === true) {
        queryBuilder.andWhere('category.parent_id IS NOT NULL');
      } else {
        queryBuilder.andWhere('category.parent_id IS NULL');
      }
    }

    const [categories, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: categories,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    return this.categoryRepository.save({ ...category, ...updateCategoryDto });
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);

    // Tìm tất cả category con
    const children = await this.categoryRepository.find({
      where: { parentId: id },
    });

    // Soft delete tất cả category con trước
    if (children.length > 0) {
      await this.categoryRepository.softRemove(children);
    }

    // Sau đó soft delete category cha
    await this.categoryRepository.softRemove(category);
  }

  async restore(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new BadRequestException(`Category with ID ${id} not found`);
    }

    if (!category.deletedAt) {
      throw new BadRequestException(`Category with ID ${id} is not deleted`);
    }

    // Restore category cha trước
    await this.categoryRepository.restore(id);

    // Tìm và restore tất cả category con đã bị xóa
    const children = await this.categoryRepository.find({
      where: { parentId: id },
      withDeleted: true,
    });

    const deletedChildren = children.filter((child) => child.deletedAt);
    if (deletedChildren.length > 0) {
      const childIds = deletedChildren.map((child) => child.id);
      await this.categoryRepository.restore(childIds);
    }

    return this.findById(id);
  }

  async hardDelete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new BadRequestException(`Category with ID ${id} not found`);
    }

    // Tìm tất cả category con (bao gồm cả đã xóa)
    const children = await this.categoryRepository.find({
      where: { parentId: id },
      withDeleted: true,
    });

    // Hard delete tất cả category con trước
    if (children.length > 0) {
      await this.categoryRepository.remove(children);
    }

    // Sau đó hard delete category cha
    await this.categoryRepository.remove(category);
  }
}
