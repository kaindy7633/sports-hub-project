import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 角色装饰器的元数据键
 */
export const ROLES_KEY = 'roles';

/**
 * 角色装饰器
 * @param roles 允许访问的角色列表
 */
export const Roles = (...roles: string[]) => {
  return (target: any, key?: string, descriptor?: any) => {
    // 如果descriptor存在，说明装饰器应用于方法
    if (descriptor) {
      Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
      return descriptor;
    }
    // 否则装饰器应用于类
    else {
      Reflect.defineMetadata(ROLES_KEY, roles, target);
      return target;
    }
  };
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由处理程序上定义的角色
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    // 如果没有定义角色，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 确保用户已经通过了JWT认证
    if (!user) {
      throw new UnauthorizedException('用户未认证');
    }

    // 检查用户是否具有所需角色
    // 这里假设user对象中有roles属性，包含用户的角色列表
    // 实际实现可能需要根据项目的用户模型进行调整
    const hasRole = requiredRoles.some(
      (role) => user.roles?.includes(role) || user.role === role,
    );

    if (!hasRole) {
      throw new UnauthorizedException('您没有足够的权限执行此操作');
    }

    return true;
  }
}
