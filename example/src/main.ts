import * as os from 'os';
import * as throng from 'throng';
import { NestFactory } from '@nestjs/core';
import { AppModule as MasterModule } from './master/app.module';
import { AppModule as WorkerModule } from './worker/app.module';

async function bootstrap() {
  throng({
    master: async function startMaster() {
      const app = await NestFactory.create(MasterModule);
      await app.listen(3000);
      console.log(`Application master is running on: ${await app.getUrl()}`);
    },
    worker: async function startWorker(id: number) {
      await NestFactory.createApplicationContext(WorkerModule);
      console.log(`Application worker#${id} is running`);
    },
    count: os.cpus().length,
  });
}

bootstrap();
