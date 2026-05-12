// https://dev.qweather.com/docs/configuration/authentication/#json-web-token
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, importPKCS8 } from 'jose';
import pinyin from 'pinyin';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QweatherService {
  @Inject(HttpService)
  private readonly httpService: HttpService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  async getJWT() {
    const YOUR_PRIVATE_KEY = this.configService.get<string>('YOUR_PRIVATE_KEY')!;
    const YOUR_KEY_ID = this.configService.get<string>('YOUR_KEY_ID')!;
    const YOUR_PROJECT_ID = this.configService.get<string>('YOUR_PROJECT_ID')!;
    const privateKey = await importPKCS8(YOUR_PRIVATE_KEY, 'EdDSA');
    const customHeader = {
      alg: 'EdDSA',
      kid: YOUR_KEY_ID,
    };
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 900;
    const customPayload = {
      sub: YOUR_PROJECT_ID,
      iat: iat,
      exp: exp,
    };
    const token = await new SignJWT(customPayload)
      .setProtectedHeader(customHeader)
      .sign(privateKey);
    return token;
  }

  async getWeather(cityId: number, days: '3d' | '7d' | '10d' | '15d' | '30' = '7d') {
    const YOUR_API_HOST = this.configService.get<string>('YOUR_API_HOST');
    const url = `https://${YOUR_API_HOST}/v7/weather/${days}?location=${cityId}`;
    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${await this.getJWT()}`,
        },
      }),
    );
    return data;
  }

  async getCityIdByCityName(cityName: string) {
    const location = pinyin(cityName, { style: pinyin.STYLE_NORMAL }).join('');
    const YOUR_API_HOST = this.configService.get<string>('YOUR_API_HOST');
    const url = `https://${YOUR_API_HOST}/geo/v2/city/lookup?location=${location}`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${await this.getJWT()}`,
          },
        }),
      );
      return data?.location?.[0]?.id;
    } catch (error) {
      console.error(`Error fetching city ID for "${cityName}":`, error);
      throw new BadRequestException(error.response?.data?.error?.message || 'Failed to fetch city ID');
    }
  }
}
