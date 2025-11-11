import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add a course to user wishlist' })
  @ApiResponse({ status: 201, description: 'Course successfully added to wishlist' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addToWishlist(@Body() createWishlistDto: CreateWishlistDto, @CurrentUser() user: User) {
    return this.wishlistService.addToWishlist(user.id, createWishlistDto.courseId);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  @ApiResponse({ status: 200, description: 'Returns the user wishlist with courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCurrentUserWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getWishlistByUserId(user.id);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Remove a course from user wishlist' })
  @ApiResponse({ status: 200, description: 'Course successfully removed from wishlist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found in wishlist' })
  removeFromWishlist(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.wishlistService.removeFromWishlist(user.id, courseId);
  }
}
