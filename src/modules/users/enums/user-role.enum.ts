// src/modules/users/enums/user-role.enum.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  // 可以添加其他角色，如
  // MANAGER = 'manager',
  // CONTENT_CREATOR = 'content_creator',
}

// src/modules/users/enums/user-status.enum.ts
export enum UserStatus {
  INACTIVE = 0, // 未激活
  ACTIVE = 1, // 正常
  DISABLED = 2, // 已禁用
  // 可以添加其他状态，如
  // PENDING = 3, // 待审核
  // BANNED = 4,  // 已封禁
}
