import { Controller, Get } from '@nestjs/common';
import { InjectClusterIpc } from 'nest-cluster-ipc';
import { ClusterIpc } from 'node-cluster-ipc';

@Controller()
export class AppController {
  constructor(@InjectClusterIpc() private readonly ipc: ClusterIpc) {}

  @Get()
  async execute() {
    const data = [1, 2, 3, 4, 5];
    return this.ipc.request('sum', data);
  }
}
