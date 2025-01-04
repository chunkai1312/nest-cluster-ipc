import { Module } from '@nestjs/common';
import { ClusterIpcModule } from 'nest-cluster-ipc';
import { AppService } from './app.service'

@Module({
  imports: [ClusterIpcModule.forRoot()],
  providers: [AppService],
})
export class AppModule {}
