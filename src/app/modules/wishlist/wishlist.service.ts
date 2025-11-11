import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../../entities/wishlist.entity';
import { Course } from '../../entities/course.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Add a course to user's wishlist
   */
  async addToWishlist(userId: string, courseId: string) {
    // Verify course exists
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    try {
      // Find or create user wishlist
      let wishlist = await this.wishlistRepository.findOne({
        where: { userId },
      });

      if (!wishlist) {
        // Create new wishlist if it doesn't exist
        wishlist = this.wishlistRepository.create({
          userId,
          courses: [courseId],
        });
      } else {
        // Add course to existing wishlist if not already in it
        const courses = wishlist.courses || [];
        if (courses.includes(courseId)) {
          throw new BadRequestException('Course is already in wishlist');
        }

        wishlist.courses = [...courses, courseId];
      }

      // Save changes
      await this.wishlistRepository.save(wishlist);

      return {
        message: 'Course added to wishlist successfully',
        wishlist,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add course to wishlist');
    }
  }

  /**
   * Get user's wishlist with course details
   */
  async getWishlistByUserId(userId: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist || !wishlist.courses || wishlist.courses.length === 0) {
      return {
        message: 'Wishlist is empty',
        wishlist: {
          userId,
          courses: [],
          courseDetails: [],
        },
      };
    }

    // Get details of all courses in the wishlist
    const courseDetails = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.id IN (:...ids)', { ids: wishlist.courses })
      .select([
        'course.id',
        'course.name',
        'course.description',
        'course.thumbnail',
        'course.price',
        'course.saleInfo',
        'course.averageRating',
        'course.numberOfStudents',
      ])
      .getMany();

    return {
      message: 'Wishlist retrieved successfully',
      ...wishlist,
      courseDetails,
    };
  }

  /**
   * Remove a course from user's wishlist
   */
  async removeFromWishlist(userId: string, courseId: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist || !wishlist.courses) {
      throw new NotFoundException('Wishlist not found');
    }

    const courseIndex = wishlist.courses.indexOf(courseId);
    if (courseIndex === -1) {
      throw new NotFoundException(`Course with ID ${courseId} not found in wishlist`);
    }

    // Remove course from array
    wishlist.courses = wishlist.courses.filter((id) => id !== courseId);

    // Save changes
    await this.wishlistRepository.save(wishlist);

    return {
      message: 'Course removed from wishlist successfully',
      wishlist,
    };
  }
}
