import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplyScope, Voucher } from 'src/app/entities/vouchers.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CoursesService } from '../courses/courses.service';
import { VoucherFilter } from 'src/app/shared/utils/filter-utils';
import { PaginationResponse } from 'src/app/shared/utils/response-utils';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly categoriesService: CategoriesService,
    private readonly coursesService: CoursesService,
  ) {}

  private async validateVoucher(createVoucherDto: CreateVoucherDto): Promise<void> {
    if (createVoucherDto.applyScope === ApplyScope.CATEGORY && createVoucherDto.categoryId) {
      await this.categoriesService.findById(createVoucherDto.categoryId);
    }

    if (createVoucherDto.applyScope === ApplyScope.COURSE && createVoucherDto.courseId) {
      await this.coursesService.findOne(createVoucherDto.courseId);
    }
  }

  async create(createVoucherDto: CreateVoucherDto, userId: string): Promise<Voucher> {
    await this.validateVoucher(createVoucherDto);
    const voucher = this.voucherRepository.create({ ...createVoucherDto, userId });
    return await this.voucherRepository.save(voucher);
  }

  async findAll(filter: VoucherFilter): Promise<PaginationResponse<Voucher>> {
    const {
      page = 1,
      limit = 10,
      name,
      code,
      discountType,
      applyScope,
      categoryId,
      courseId,
      isActive,
      startDate,
      endDate,
    } = filter;

    const queryBuilder = this.voucherRepository.createQueryBuilder('voucher');

    if (name) {
      queryBuilder.andWhere('voucher.name ILIKE :name', { name: `%${name}%` });
    }

    if (code) {
      queryBuilder.andWhere('voucher.code ILIKE :code', { code: `%${code}%` });
    }

    if (discountType) {
      queryBuilder.andWhere('voucher.discount_type = :discountType', { discountType });
    }

    if (applyScope) {
      queryBuilder.andWhere('voucher.apply_scope = :applyScope', { applyScope });
    }

    if (categoryId) {
      queryBuilder.andWhere('voucher.category_id = :categoryId', { categoryId });
    }

    if (courseId) {
      queryBuilder.andWhere('voucher.course_id = :courseId', { courseId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('voucher.is_active = :isActive', { isActive });
    }

    if (startDate) {
      queryBuilder.andWhere('voucher.start_date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('voucher.end_date <= :endDate', { endDate });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    queryBuilder.orderBy('voucher.created_at', 'DESC');

    const [vouchers, total] = await queryBuilder.getManyAndCount();
    return {
      items: vouchers,
      pagination: {
        totalPage: Math.ceil(total / limit),
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({ where: { id } });
    if (!voucher) {
      throw new BadRequestException(`Voucher with ID ${id} not found`);
    }
    return voucher;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.findOne(id);
    Object.assign(voucher, updateVoucherDto);
    return await this.voucherRepository.save(voucher);
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.findOne(id);
    await this.voucherRepository.remove(voucher);
  }
}
