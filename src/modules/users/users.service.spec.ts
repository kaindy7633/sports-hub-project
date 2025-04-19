import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository;
  let userAuthRepository;
  let roleRepository;
  let userRoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    userAuthRepository = module.get(getRepositoryToken(UserAuth));
    roleRepository = module.get(getRepositoryToken(Role));
    userRoleRepository = module.get(getRepositoryToken(UserRole));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        nick_name: 'Test User',
        phone: '13800138000',
      };

      const user = {
        id: BigInt(1),
        user_id: BigInt(Date.now()),
        ...createUserDto,
        password: 'hashedPassword',
        salt: 'salt',
      };

      userRepository.create.mockReturnValue(user);
      userRepository.save.mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: BigInt(1), username: 'user1' },
        { id: BigInt(2), username: 'user2' },
      ];

      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: BigInt(1), username: 'user1' };

      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        relations: ['auths', 'roles'],
      });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update and return a user', async () => {
      const id = 1;
      const updateUserDto = { nick_name: 'Updated Name' };
      const user = {
        id: BigInt(id),
        username: 'user1',
        nick_name: 'Old Name',
        salt: 'salt',
      };
      const updatedUser = {
        ...user,
        nick_name: updateUserDto.nick_name,
      };

      service.findOne = jest.fn().mockResolvedValue(user);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(id, updateUserDto);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = 1;

      await service.remove(id);

      expect(userRepository.softDelete).toHaveBeenCalledWith(BigInt(id));
    });
  });

  describe('addUserAuth', () => {
    it('should add user authentication', async () => {
      const authData = {
        userId: 1,
        identityType: 'phone',
        identifier: '13800138000',
        credential: 'validation_code',
      };

      const userAuth = {
        user_id: BigInt(authData.userId),
        identity_type: authData.identityType,
        identifier: authData.identifier,
        credential: authData.credential,
      };

      userAuthRepository.create.mockReturnValue(userAuth);
      userAuthRepository.save.mockResolvedValue(userAuth);

      const result = await service.addUserAuth(authData);

      expect(userAuthRepository.create).toHaveBeenCalled();
      expect(userAuthRepository.save).toHaveBeenCalled();
      expect(result).toEqual(userAuth);
    });
  });
});
