import { DataSource } from 'typeorm';
import { Course } from '../../app/entities/course.entity';
import { CourseLevel, SaleType } from '../../app/entities/enums/course.enum';

export async function seedCourses(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);

  const categoryIds = [
    '00f490f0-434e-4757-b0a9-f2e3a0af7797',
    'ad48a249-c9fd-44ae-abf2-991ea73da34b',
    '972d02b3-91e5-4164-826b-95d65a64f1a7',
  ];
  const createdBy = '8f156a3f-bb9c-4044-9eff-ae6c5fc249db';
  const thumbnail =
    'https://hoidanit.vn/_next/image?url=https%3A%2F%2Fhoidanit.vn%2Fimages%2F2610799786e82f64a8aea3b0ecd23b55c.png&w=1920&q=75';

  // Helper function to get random category
  const getRandomCategory = () => categoryIds[Math.floor(Math.random() * categoryIds.length)];

  const courses = [
    // Web Development Courses
    {
      name: 'Lập trình Web với ReactJS từ cơ bản đến nâng cao',
      description:
        'Khóa học ReactJS toàn diện, từ JSX, Components, Hooks đến Redux Toolkit và React Router. Bao gồm nhiều dự án thực tế giúp bạn làm chủ React.',
      notes: 'Yêu cầu: Biết HTML, CSS, JavaScript cơ bản',
      thumbnail,
      price: 599000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 3600,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Node.js & NestJS - Xây dựng RESTful API chuyên nghiệp',
      description:
        'Học cách xây dựng backend mạnh mẽ với Node.js và NestJS framework. TypeORM, JWT Authentication, Testing và Deploy lên production.',
      notes: 'Yêu cầu: JavaScript ES6+, TypeScript cơ bản',
      thumbnail,
      price: 799000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 25,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 4800,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'HTML CSS từ Zero đến Hero',
      description:
        'Khóa học HTML CSS cho người mới bắt đầu. Học cách tạo website responsive, flexbox, grid, animations và nhiều kỹ thuật hiện đại.',
      notes: 'Không yêu cầu kiến thức nền',
      thumbnail,
      price: 299000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 2400,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'JavaScript ES6+ & TypeScript Masterclass',
      description:
        'Làm chủ JavaScript hiện đại và TypeScript. Arrow functions, Promises, Async/Await, Modules, và tất cả tính năng ES6+.',
      notes: 'Biết JavaScript cơ bản',
      thumbnail,
      price: 499000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 20,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 3000,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Vue.js 3 - The Complete Guide',
      description:
        'Học Vue.js 3 với Composition API, Pinia State Management, Vue Router và Vite. Xây dựng SPA hiện đại với Vue.',
      notes: 'Yêu cầu: HTML, CSS, JavaScript',
      thumbnail,
      price: 549000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 3300,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // Mobile Development
    {
      name: 'React Native - Xây dựng ứng dụng di động đa nền tảng',
      description:
        'Tạo app iOS và Android với React Native. Navigation, State Management, Native Modules, và Deploy lên App Store & Google Play.',
      notes: 'Biết React.js',
      thumbnail,
      price: 899000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 35,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 5400,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Flutter & Dart - Lập trình Mobile toàn diện',
      description:
        'Từ Dart cơ bản đến Flutter nâng cao. Widget, State Management với Bloc/Riverpod, Firebase integration, và nhiều hơn nữa.',
      notes: 'Không yêu cầu kinh nghiệm trước',
      thumbnail,
      price: 699000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 4200,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // Database & Backend
    {
      name: 'PostgreSQL từ cơ bản đến nâng cao',
      description:
        'Làm chủ PostgreSQL - database mạnh mẽ nhất. Query optimization, indexing, transactions, stored procedures và performance tuning.',
      notes: 'Biết SQL cơ bản',
      thumbnail,
      price: 449000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 2700,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'MongoDB & Mongoose - NoSQL Database Mastery',
      description:
        'Học MongoDB từ đầu. Document model, aggregation, indexes, replication, sharding và integration với Node.js qua Mongoose.',
      notes: 'Biết JavaScript',
      thumbnail,
      price: 399000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 25,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 2400,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'GraphQL APIs - Modern API Development',
      description:
        'Xây dựng GraphQL APIs với Apollo Server. Schema design, resolvers, subscriptions, authentication và best practices.',
      notes: 'Biết REST API',
      thumbnail,
      price: 649000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 3600,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // DevOps & Cloud
    {
      name: 'Docker & Kubernetes cho Developer',
      description:
        'Container hóa ứng dụng với Docker và orchestration với Kubernetes. CI/CD pipelines, microservices deployment.',
      notes: 'Biết Linux cơ bản',
      thumbnail,
      price: 799000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 40,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 4500,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'AWS Cloud Practitioner - Cloud Computing Essentials',
      description:
        'Học Amazon Web Services từ cơ bản. EC2, S3, RDS, Lambda, API Gateway và các services phổ biến khác.',
      notes: 'Không yêu cầu kiến thức cloud',
      thumbnail,
      price: 599000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 3000,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // AI & Data Science
    {
      name: 'Python cho Data Science & Machine Learning',
      description:
        'Pandas, NumPy, Matplotlib, Scikit-learn và TensorFlow. Từ data analysis đến building ML models.',
      notes: 'Biết Python cơ bản',
      thumbnail,
      price: 999000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 35,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 6000,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Deep Learning với TensorFlow & Keras',
      description:
        'Neural Networks, CNN, RNN, LSTM và Transformers. Computer vision, NLP và các ứng dụng AI thực tế.',
      notes: 'Biết Python và Math',
      thumbnail,
      price: 1299000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 40,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 7200,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // UI/UX & Design
    {
      name: 'Figma UI/UX Design - Từ ý tưởng đến sản phẩm',
      description:
        'Thiết kế giao diện chuyên nghiệp với Figma. User research, wireframing, prototyping, design systems và handoff.',
      notes: 'Không yêu cầu kinh nghiệm',
      thumbnail,
      price: 499000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 2700,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'TailwindCSS - Utility-First CSS Framework',
      description:
        'Làm chủ TailwindCSS để build UI nhanh chóng. Responsive design, dark mode, components và customization.',
      notes: 'Biết CSS',
      thumbnail,
      price: 349000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 20,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 1800,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // Testing & Quality
    {
      name: 'Testing trong JavaScript - Jest, Testing Library & Cypress',
      description:
        'Unit testing, integration testing, E2E testing. TDD approach và best practices trong testing.',
      notes: 'Biết JavaScript',
      thumbnail,
      price: 549000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 3000,
      categoryId: getRandomCategory(),
      createdBy,
    },

    // Specialized Topics
    {
      name: 'Microservices Architecture với Node.js',
      description:
        'Thiết kế và triển khai microservices. Message queues, service discovery, API gateway, distributed tracing.',
      notes: 'Có kinh nghiệm backend',
      thumbnail,
      price: 899000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 30,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 5400,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Git & GitHub - Version Control Mastery',
      description:
        'Làm chủ Git từ cơ bản đến nâng cao. Branching strategies, merge conflicts, rebasing, GitHub workflows và collaboration.',
      notes: 'Không yêu cầu kiến thức',
      thumbnail,
      price: 249000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.BEGINNER,
      totalDuration: 1500,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Next.js 14 - Full-stack React Framework',
      description:
        'App Router, Server Components, Server Actions, caching strategies và deploy lên Vercel. Build production-ready apps.',
      notes: 'Biết React.js',
      thumbnail,
      price: 749000,
      saleInfo: {
        saleType: SaleType.PERCENT,
        value: 35,
        saleStartDate: new Date('2024-11-01'),
        saleEndDate: new Date('2024-12-31'),
      },
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.ADVANCED,
      totalDuration: 4200,
      categoryId: getRandomCategory(),
      createdBy,
    },
    {
      name: 'Redis - In-Memory Database & Caching',
      description:
        'Tối ưu hiệu suất ứng dụng với Redis. Caching strategies, pub/sub, sessions, rate limiting và real-time features.',
      notes: 'Có kinh nghiệm backend',
      thumbnail,
      price: 449000,
      rating: 0,
      status: true,
      averageRating: 0,
      numberOfStudents: 0,
      level: CourseLevel.INTERMEDIATE,
      totalDuration: 2400,
      categoryId: getRandomCategory(),
      createdBy,
    },
  ];

  // Insert courses
  await courseRepository
    .createQueryBuilder()
    .insert()
    .into(Course)
    .values(courses as any)
    .execute();

  console.log(`✅ Successfully seeded ${courses.length} courses!`);
}
