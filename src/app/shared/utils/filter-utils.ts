import { CourseLevel } from 'src/app/entities/enums/course.enum';

export interface CategoryFilter {
  page?: number;
  limit?: number;
  name?: string;
  parentId?: string;
  isSubCategory?: boolean;
}

export interface CourseFilter {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  courseLevel?: CourseLevel;
  createdBy?: string;
  rating?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export interface DocumentFilter {
  page?: number;
  limit?: number;
  name?: string;
  entityId?: string;
  entityType?: string;
  createdBy?: string;
}

export interface VoucherFilter {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
  discountType?: string;
  applyScope?: string;
  categoryId?: string;
  courseId?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}
