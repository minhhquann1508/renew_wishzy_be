import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from './cloudinary.service';
import { BunnyService } from './bunny.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly userService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly bunnyService: BunnyService,
  ) {}

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, JPG, WEBP) are allowed');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const result = await this.cloudinaryService.uploadImage(file, 'wishzy/images');

    return {
      message: 'Image uploaded successfully',
      ...result,
    };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, JPG, WEBP) are allowed');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const user = await this.userService.findOne(userId);

    if (user.avatar) {
      try {
        const publicId = this.extractPublicIdFromUrl(user.avatar);
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    const result = await this.cloudinaryService.uploadImage(file, 'wishzy/avatars');

    const updatedUser = await this.userService.update(userId, {
      avatar: result.secure_url,
    });

    return {
      message: 'Avatar uploaded successfully',
      avatar: updatedUser.avatar,
    };
  }

  async uploadVideo(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only video files (MP4, MPEG, MOV, AVI) are allowed');
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 500MB');
    }

    // Upload to Bunny.net
    const result = await this.bunnyService.uploadVideo(file);

    return {
      message: 'Video uploaded successfully',
      ...result,
    };
  }

  private extractPublicIdFromUrl(url: string): string {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/wishzy/avatars/abc123.jpg
    // Returns: wishzy/avatars/abc123
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return '';

    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove file extension
  }
}
