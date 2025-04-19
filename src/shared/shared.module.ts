import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
      // ValidationExceptionFilter先处理验证异常
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
      // AllExceptionsFilter后处理其他所有异常
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [],
})
export class SharedModule {}
