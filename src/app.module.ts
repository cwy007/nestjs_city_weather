import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { QweatherModule } from './qweather/qweather.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({
      global: true,
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/src/.env`,
    }),
    QweatherModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
