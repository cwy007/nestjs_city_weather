import { Injectable } from '@nestjs/common';
import pinyin from 'pinyin';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getPinyin(text: string): string {
    return pinyin(text, { style: pinyin.STYLE_NORMAL }).join('');
  }
}
