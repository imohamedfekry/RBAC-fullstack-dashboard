import { Injectable } from '@nestjs/common';

@Injectable()
export class DefaultService {
  status() {
    return {
      name: 'Army API',
      version: 'v1',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
