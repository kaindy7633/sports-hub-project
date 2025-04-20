/**
 * 系统常量配置文件
 * 用于存放全局硬编码的配置值
 */

// 分页相关常量
export const PAGINATION = {
  DEFAULT_PAGE_NUM: 1, // 默认页码
  DEFAULT_PAGE_SIZE: 10, // 默认每页条数
  MAX_PAGE_SIZE: 100, // 最大每页条数
};

// 状态相关常量
export const STATUS = {
  DISABLED: 0, // 禁用状态
  ENABLED: 1, // 启用状态
};

// 角色相关常量
export const ROLES = {
  ADMIN: 'admin', // 管理员角色
  USER: 'user', // 普通用户角色
  MANAGER: 'manager', // 管理者角色
};

// 缓存相关常量
export const CACHE = {
  DEFAULT_TTL: 3600, // 默认缓存时间（秒）
};

// 活动状态相关常量
export const ACTIVITY_STATUS = {
  DRAFT: 0, // 草稿
  PUBLISHED: 1, // 已发布
  NOT_STARTED: 2, // 未开始
  IN_PROGRESS: 3, // 进行中
  FINISHED: 4, // 已结束
};

// 其他可能需要的常量...
