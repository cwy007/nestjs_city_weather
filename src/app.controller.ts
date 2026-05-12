import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('pinyin')
  getPinyin(@Query('text') text: string): string {
    return this.appService.getPinyin(text);
  }
}
