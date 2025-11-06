import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { CloudinaryService } from './cloudinary.service';
import { BunnyService } from './bunny.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, HttpModule, UsersModule],
  controllers: [UploadsController],
  providers: [UploadsService, CloudinaryService, BunnyService],
  exports: [UploadsService, CloudinaryService, BunnyService],
})
export class UploadsModule {}
