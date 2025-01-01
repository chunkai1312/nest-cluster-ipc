# nest-cluster-ipc

[![NPM version][npm-image]][npm-url]

> A Nest module for [node-cluster-ipc](https://github.com/chunkai1312/node-cluster-ipc)

## Installation

To begin using it, we first install the required dependencies.

```bash
$ npm install --save nest-cluster-ipc node-cluster-ipc
```

## Getting started

Once the installation is complete, import the `ClusterIPCModule` into the root `AppModule` and run the `forRoot()` static method as shown below:

```typescript
import { Module } from '@nestjs/common';
import { ClusterIPCModule } from 'nest-cluster-ipc';

@Module({
  imports: [
    ClusterIPCModule.forRoot(),
  ],
})
export class AppModule {}
```

Next, inject the `ClusterIPC` instance using the `@InjectClusterIPC()` decorator.

```typescript
constructor(@InjectClusterIPC() private readonly ipc: ClusterIPC) {}
```

## Sending a message to a worker

```typescript
if (this.ipc.isPrimary) {
  this.ipc.send('primary-to-worker', 'Hello, Worker!');
}
```

## Publishing a message to all workers

```typescript
if (this.ipc.isPrimary) {
  this.ipc.publish('primary-to-worker', 'Hello, Worker!');
}
```

## Sending a message to the primary (master)

```typescript
if (this.ipc.isWorker) {
  this.ipc.send('worker-to-primary', 'Hello, Primary!');
}
```

## Handling received messages

```typescript
if (this.ipc.isPrimary) {
  this.ipc.on('worker-to-primary', (channel, data) => {
    console.log(`[Primary] Received message on channel: ${channel}`, data);
  });
}

if (this.ipc.isWorker) {
  this.ipc.on('primary-to-worker', (channel, data) => {
    console.log(`[Worker] Received message on channel: ${channel}`, data);
  });
}
```

## Handling received messages with `@OnMessage()` decorator

```typescript
@OnMessage()
async handleMessage(channel, data) {
  console.log(`Received message on channel: ${channel}`, data);
}
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/nest-cluster-ipc.svg
[npm-url]: https://npmjs.com/package/nest-cluster-ipc
