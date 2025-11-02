import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from 'src/app/entities/vouchers.entity';
import { CoursesModule } from '../courses/courses.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), CategoriesModule, CoursesModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
