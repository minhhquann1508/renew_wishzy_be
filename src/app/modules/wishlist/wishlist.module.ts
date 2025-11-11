import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from '../../entities/wishlist.entity';
import { Course } from '../../entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Course])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
