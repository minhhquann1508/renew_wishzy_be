import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from 'src/app/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { VoucherFilter } from 'src/app/shared/utils/filter-utils';
import { ApiTags } from '@nestjs/swagger';

@Controller('vouchers')
@ApiTags('Vouchers')
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
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('name') name: string,
    @Query('code') code: string,
    @Query('discountType') discountType: string,
    @Query('applyScope') applyScope: string,
    @Query('categoryId') categoryId: string,
    @Query('courseId') courseId: string,
    @Query('isActive') isActive: boolean,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const filter: VoucherFilter = {
      page,
      limit,
      name,
      code,
      discountType,
      applyScope,
      categoryId,
      courseId,
      isActive,
      startDate,
      endDate,
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
