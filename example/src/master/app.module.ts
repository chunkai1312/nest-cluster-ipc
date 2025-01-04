import { Module } from '@nestjs/common';
import { ClusterIpcModule } from 'nest-cluster-ipc';
import { AppController } from './app.controller';

@Module({
  imports: [ClusterIpcModule.forRoot()],
  controllers: [AppController],
})
export class AppModule {}
