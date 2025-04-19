import { Injectable } from '@nestjs/common';
import SnowflakeId from 'snowflake-id';

@Injectable()
export class SnowflakeService {
  private snowflake: SnowflakeId;

  constructor() {
    // 配置雪花算法，可根据实际需求调整参数
    this.snowflake = new SnowflakeId({
      mid: 1, // 机器ID
      offset: (2023 - 1970) * 31536000 * 1000, // 起始时间偏移量，这里设置为2023年
    });
  }

  /**
   * 生成雪花ID
   * @returns 雪花算法生成的唯一ID（字符串格式）
   */
  generate(): string {
    return this.snowflake.generate().toString();
  }

  /**
   * 解析雪花ID
   * @param id 雪花ID
   * @returns 解析后的信息
   */
  parse(id: string): any {
    return this.snowflake.parse(id);
  }
}
