import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilterCategoryDto } from './dto/filter-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/app/entities/category.entity';
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

  async findAll(filter: FilterCategoryDto): Promise<PaginationResponse<Category>> {
    const { page = 1, limit = 10, name, parentId, isSubCategory } = filter;

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (name) {
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${name}%` });
    }

    if (parentId) {
      queryBuilder.andWhere('category.parent_id = :parentId', { parentId });
    }

    // Filter by subcategory status
    if (isSubCategory !== undefined && isSubCategory !== null) {
      if (isSubCategory === true) {
        queryBuilder.andWhere('category.parent_id IS NOT NULL');
      } else if (isSubCategory === false) {
        queryBuilder.andWhere('category.parent_id IS NULL');
      }
    }

    // Lấy thêm totalCourse khi query
    queryBuilder
      .leftJoin('courses', 'course', 'course.category_id = category.id AND course.deleted_at IS NULL')
      .addSelect('COUNT(course.id)', 'totalCourses')
      .groupBy('category.id')
      .skip((page - 1) * limit)
      .take(limit);

    const result = await queryBuilder.getRawAndEntities();
    const total = await this.categoryRepository.createQueryBuilder('category').getCount();

    const categoriesWithCount = result.entities.map((category: Category, index: number) => ({
      ...category,
      totalCourses: parseInt(result.raw[index]?.totalCourses || '0'),
    }));

    return {
      items: categoriesWithCount,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findById(id: string): Promise<Category> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.id = :id', { id })
      .leftJoin('courses', 'course', 'course.category_id = category.id AND course.deleted_at IS NULL')
      .addSelect('COUNT(course.id)', 'totalCourses')
      .groupBy('category.id');

    const result = await queryBuilder.getRawAndEntities();

    if (!result.entities.length) {
      throw new BadRequestException(`Category with ID ${id} not found`);
    }

    const category = result.entities[0];
    const totalCourses = parseInt(result.raw[0]?.totalCourses || '0');

    return {
      ...category,
      totalCourses,
    } as Category;
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
