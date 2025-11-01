import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../../src/app/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  const testUser = {
    userName: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
  };
  let hashedPassword: string;

  beforeAll(async () => {
    // Hash the password
    hashedPassword = await bcrypt.hash(testUser.password, 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  beforeEach(async () => {
    // Clean the user repository
    await userRepository.clear();
    // Create test user
    await userRepository.save({
      ...testUser,
      password: hashedPassword,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should return JWT token when login is successful', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(typeof res.body.accessToken).toBe('string');
        });
    });

    it('should return 401 when password is incorrect', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 400 when email is not found', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(400);
    });
  });
});
