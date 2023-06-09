import { NestFactory } from '@nestjs/core';
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { AppModule } from './app.module';
import { initDoc } from './doc/index';
import { ConfigService } from '@nestjs/config';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  // 创建时就指定logger, 所有框架消息都能打印
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true,
    // logger: false,
  });
  initDoc(app);
  // 全局前缀
  app.setGlobalPrefix('/api');
  // 版本控制
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  // app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  // 全局注册拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.get('port'));

  return configService;
}

bootstrap().then((configService) => {
  console.log(
    `🤩 应用程序接口地址： http://localhost:${configService.get<number>(
      'port',
    )}`,
  );
  console.log('🚀 服务应用已经成功启动！');
});
