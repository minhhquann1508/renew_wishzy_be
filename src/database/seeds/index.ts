import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { seedCourses } from './course.seeder';
import { Course } from '../../app/entities/course.entity';
import { Category } from '../../app/entities/category.entity';
import { User } from '../../app/entities/user.entity';
import { Chapter } from '../../app/entities/chapter.entity';

async function runSeeders() {
  console.log('🌱 Starting database seeding...');

  // Add entities to dataSource options
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [Course, Category, User, Chapter],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Run seeders
    await seedCourses(dataSource);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
