// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { Logger } from '@nestjs/common';

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   private readonly logger = new Logger(LoggingInterceptor.name);

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const request = context.switchToHttp().getRequest();
//     const response = context.switchToHttp().getResponse();
//     const { method, url } = request;

//     return next
//       .handle()
//       .pipe(
//         tap(data => {
//           const statusCode = response.statusCode;
//           this.logger.log(`${method} ${url} ${statusCode} - Response: ${JSON.stringify(data)}`);
//         })
//       );
//   }
// }

import { Logger } from '@nestjs/common';

const logger = new Logger('CustomLogger');

export const logResponse = (method: string, url: string, statusCode: number, data: any) => {
  logger.log(`${method} ${url} ${statusCode} - Response: ${JSON.stringify(data)}`);
}
