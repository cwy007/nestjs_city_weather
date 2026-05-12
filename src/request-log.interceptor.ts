import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { firstValueFrom, Observable, tap } from 'rxjs';
import requestIp from 'request-ip';
import { HttpService } from '@nestjs/axios';
import * as iconv from 'iconv-lite';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLogInterceptor.name);

  @Inject(HttpService)
  private readonly httpService: HttpService;

  async ipToCity(ip: string): Promise<string> {
    // curl - s "https://whois.pconline.com.cn/ipJson.jsp?ip=221.237.121.165&json=true"
    const url = `https://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`;
    try {
      const { data } = await firstValueFrom(this.httpService.get(url, { responseType: 'arraybuffer' }));
      const decodedData = iconv.decode(Buffer.from(data), 'GBK');
      const json = JSON.parse(decodedData);
      return json?.addr;
    } catch (error) {
      this.logger.error(`Failed to fetch city for IP ${ip}: ${error.message}`);
      return 'Unknown';
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const userAgent = request.headers['user-agent'];

    const { method, path, ip } = request;
    const clientIp = requestIp.getClientIp(request);

    const city = await this.ipToCity('221.237.121.165');
    console.log(`Client IP: ${clientIp}, City: ${city}`);

    this.logger.debug(
      `${method} ${path} - ${clientIp} ${userAgent} ${context.getClass().name}.${context.getHandler().name} invoked...`,
    );

    const now = Date.now();
    return next.handle().pipe(tap((res) => {
      this.logger.debug(
        `${method} ${path} - ${ip} ${userAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
      );
      this.logger.debug(`Response: ${JSON.stringify(res)}`);
    }));
  }
}
