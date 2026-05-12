import { Global, Module } from '@nestjs/common';
import { QweatherService } from './qweather.service';

@Global()
@Module({
  providers: [QweatherService],
  exports: [QweatherService],
})
export class QweatherModule { }
