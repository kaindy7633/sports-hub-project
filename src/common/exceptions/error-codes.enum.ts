/**
 * 业务错误码枚举
 * 错误码格式：ABBCC
 * A: 错误类型 (4-客户端错误, 5-服务端错误)
 * BB: 模块编号 (01-用户模块, 02-团队模块, 03-管理员模块, ...)
 * CC: 具体错误编号
 */
export enum ErrorCode {
  // 通用错误 (00模块)
  PARAM_INVALID = 40001, // 请求参数无效
  RESOURCE_NOT_FOUND = 40004, // 资源不存在
  PERMISSION_DENIED = 40300, // 权限不足 - 修改为40300，避免与ADMIN_NOT_FOUND冲突
  SERVER_ERROR = 50000, // 服务器内部错误

  // 用户模块错误 (01模块)
  USER_NOT_FOUND = 40101, // 用户不存在
  USER_ALREADY_EXISTS = 40102, // 用户已存在
  USER_PASSWORD_ERROR = 40103, // 密码错误
  VERIFICATION_CODE_INVALID = 40104, // 验证码无效

  // 管理员模块错误 (03模块)
  ADMIN_NOT_FOUND = 40301, // 管理员不存在
  ADMIN_ALREADY_EXISTS = 40302, // 管理员已存在
  ADMIN_PASSWORD_ERROR = 40303, // 管理员密码错误
  ADMIN_LOGIN_FAILED = 40304, // 管理员登录失败

  // 团队模块错误 (02模块)
  TEAM_NOT_FOUND = 40201, // 团队不存在
  TEAM_ALREADY_EXISTS = 40202, // 团队已存在
}

/**
 * 错误码对应的错误消息
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.PARAM_INVALID]: '请求参数无效',
  [ErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.SERVER_ERROR]: '服务器内部错误',

  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.USER_PASSWORD_ERROR]: '密码错误',
  [ErrorCode.VERIFICATION_CODE_INVALID]: '验证码无效',

  [ErrorCode.ADMIN_NOT_FOUND]: '管理员不存在',
  [ErrorCode.ADMIN_ALREADY_EXISTS]: '管理员已存在',
  [ErrorCode.ADMIN_PASSWORD_ERROR]: '管理员密码错误',
  [ErrorCode.ADMIN_LOGIN_FAILED]: '管理员登录失败',

  [ErrorCode.TEAM_NOT_FOUND]: '团队不存在',
  [ErrorCode.TEAM_ALREADY_EXISTS]: '团队已存在',
};
