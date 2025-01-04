import { Injectable } from '@nestjs/common';
import { OnRequest } from 'nest-cluster-ipc';

@Injectable()
export class AppService {
  @OnRequest('sum')
  handleRequest(data, reply) {
    reply((data || []).reduce((a, b) => a + b));
  }
}
