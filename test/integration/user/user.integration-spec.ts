import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../../src/app/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;
  const testUser = {
    userName: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
  };
  let hashedPassword: string;
  let authToken: string;
  let userId: number;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Clean the user repository
    await userRepository.clear();
    // Create test user
    const user = await userRepository.save({
      ...testUser,
      password: hashedPassword,
    });
    userId = user.id;

    // Generate a JWT token for authorization
    const payload = {
      email: user.email,
      sub: user.id,
      userName: user.userName,
    };
    authToken = jwtService.sign(payload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/profile', () => {
    it('should return user profile when authenticated', async () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.userName).toBe(testUser.userName);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should return 401 when not authenticated', async () => {
      return request(app.getHttpServer()).get('/users/profile').expect(401);
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile when authenticated', async () => {
      const updatedProfile = {
        userName: 'updateduser',
      };

      return request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedProfile)
        .expect(200)
        .expect((res) => {
          expect(res.body.userName).toBe(updatedProfile.userName);
          expect(res.body.email).toBe(testUser.email);
        });
    });
  });
});
