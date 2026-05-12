import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { QweatherService } from './qweather/qweather.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly qweatherService: QweatherService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('pinyin')
  getPinyin(@Query('text') text: string): string {
    return this.appService.getPinyin(text);
  }

  @Get('weather/:cityName')
  async getWeather(@Param('cityName') cityName: string, @Query('days') days: '3d' | '7d' | '10d' | '15d' | '30' = '7d') {
    const cityId = await this.qweatherService.getCityIdByCityName(cityName);
    if (!cityId) {
      throw new BadRequestException(`City "${cityName}" not found`);
    }
    return this.qweatherService.getWeather(cityId, days);
  }
}
