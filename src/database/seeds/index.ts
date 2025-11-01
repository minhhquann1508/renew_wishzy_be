import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { seedUsers } from './user.seeder';
import { User } from '../../app/entities/user.entity';

async function runSeeders() {
  console.log('🌱 Starting database seeding...');

  // Add entities to dataSource options
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [User],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Run seeders
    await seedUsers(dataSource);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeders();
