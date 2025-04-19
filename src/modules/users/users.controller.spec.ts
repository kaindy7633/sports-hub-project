import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserAuth),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        nick_name: 'Test User',
        phone: '13800138000',
      };

      const mockUser = {
        id: BigInt(1),
        ...createUserDto,
        password: 'hashedPassword',
        salt: 'salt',
        user_id: BigInt(1),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser as User);

      expect(await controller.create(createUserDto)).toBe(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with filters', async () => {
      const mockPaginatedResult = {
        list: [
          { id: BigInt(1), username: 'user1' },
          { id: BigInt(2), username: 'user2' },
        ],
        total: 2,
        pageNum: 1,
        pageSize: 10,
      };

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(
          mockPaginatedResult as {
            list: User[];
            total: number;
            pageNum: number;
            pageSize: number;
          },
        );

      const pageNum = 1;
      const pageSize = 10;
      const username = 'test';
      const phone = '13800138000';
      const email = 'test@example.com';

      expect(
        await controller.findAll(pageNum, pageSize, username, phone, email),
      ).toBe(mockPaginatedResult);
      expect(service.findAll).toHaveBeenCalledWith({
        pageNum: pageNum,
        pageSize: pageSize,
        username,
        phone,
        email,
      });
    });
  });

  describe('findAllList', () => {
    it('should return all users with filters', async () => {
      const mockUsers = [
        { id: BigInt(1), username: 'user1' },
        { id: BigInt(2), username: 'user2' },
      ];

      jest.spyOn(service, 'findAllList').mockResolvedValue(mockUsers as User[]);

      const username = 'test';
      const phone = '13800138000';
      const email = 'test@example.com';

      expect(await controller.findAllList(username, phone, email)).toBe(
        mockUsers,
      );
      expect(service.findAllList).toHaveBeenCalledWith({
        username,
        phone,
        email,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: BigInt(1), username: 'user1' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser as User);

      expect(await controller.findOne('1')).toBe(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
