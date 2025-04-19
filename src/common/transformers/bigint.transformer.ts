import { ValueTransformer } from 'typeorm';

/**
 * BigInt类型转换器
 * 确保数据库中的BigInt类型与应用程序中的字符串类型正确转换
 */
export class BigIntTransformer implements ValueTransformer {
  /**
   * 从数据库读取时的转换函数
   * 将bigint转换为string
   */
  from(value: string | bigint | null): string | null {
    return value != null ? value.toString() : null;
  }

  /**
   * 写入数据库时的转换函数
   * 保持原值
   */
  to(value: string | bigint | null): string | bigint | null {
    return value;
  }
}
