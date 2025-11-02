import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { VoucherFilter } from 'src/app/shared/utils/filter-utils';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('vouchers')
@ApiTags('Vouchers')
@ApiBearerAuth('bearer')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createVoucherDto: CreateVoucherDto, @CurrentUser() user: User) {
    const voucher = await this.vouchersService.create(createVoucherDto, user.id);
    return {
      message: 'Voucher created successfully',
      ...voucher,
    };
  }

  @Get()
  async findAll(@Query() query: any) {
    const filter: VoucherFilter = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      name: query.name,
      code: query.code,
      discountType: query.discountType,
      applyScope: query.applyScope,
      categoryId: query.categoryId,
      courseId: query.courseId,
      isActive: query.isActive === 'true',
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };
    const results = await this.vouchersService.findAll(filter);

    return {
      message: 'Vouchers retrieved successfully',
      ...results,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const voucher = await this.vouchersService.findOne(id);
    return {
      message: 'Voucher found successfully',
      ...voucher,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    const voucher = await this.vouchersService.update(id, updateVoucherDto);
    return {
      message: 'Voucher updated successfully',
      ...voucher,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.vouchersService.remove(id);
    return {
      message: 'Voucher deleted successfully',
    };
  }
}
