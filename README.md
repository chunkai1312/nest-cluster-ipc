# nest-cluster-ipc

[![NPM version][npm-image]][npm-url]

> A Nest module for [node-cluster-ipc](https://github.com/chunkai1312/node-cluster-ipc)

## Installation

To begin using it, we first install the required dependencies.

```bash
$ npm install --save nest-cluster-ipc node-cluster-ipc
```

## Getting Started

Once the installation is complete, import the `ClusterIpcModule` into the root `AppModule` and run the `forRoot()` static method as shown below:

```typescript
import { Module } from '@nestjs/common';
import { ClusterIpcModule } from 'nest-cluster-ipc';

@Module({
  imports: [
    ClusterIpcModule.forRoot({ requestTimeout: 5000 }),
  ],
})
export class AppModule {}
```

Next, inject the `ClusterIpc` instance using the `@InjectClusterIpc()` decorator.

```typescript
constructor(@InjectClusterIpc() private readonly ipc: ClusterIpc) {}
```

### Send Message to Worker

You can send a message to a specific worker by providing the `channel` and `data`. Optionally, specify the `workerId` to target a specific worker.

```typescript
this.ipc.send('channel-name', { key: 'value' }, workerId);
```

### Publish Message to All Workers

Only the primary process can call `publish`. This will send a message to all available workers.

```typescript
this.ipc.publish('channel-name', { key: 'value' });
```

### Request/Reply between Processes

You can make requests to workers with `request()`. It returns a `Promise` and handles the timeout automatically.

```typescript
this.ipc.request('channel-name', { key: 'value' }).then(response => {
  console.log('Response:', response);
}).catch(error => {
  console.error('Error:', error);
});
```

### Handling Messages and Requests

You can listen for messages and requests from workers using the `message` and `request` events. In case of a request, you can provide a response using the callback function.

```typescript
this.ipc.on('message', (channel, data) => {
  console.log(`Received message on ${channel}:`, data);
});

this.ipc.on('request', (channel, data, reply) => {
  console.log(`Received request on ${channel}:`, data);
  reply({ responseKey: 'responseValue' });
});
```

Alternatively, you can use the decorators `@OnMessage()` and `@OnRequest()` for a cleaner and more declarative approach:

```typescript
@OnMessage('channel-name')
async handleMessage(data) {
  console.log(`Received message on 'channel-name':`, data);
}

@OnRequest('channel-name')
async handleRequest(data, reply) {
  console.log(`Received request on 'channel-name':`, data);
  reply({ responseKey: 'responseValue' });
}
```

## Async configuration

When you need to pass module options asynchronously instead of statically, use the `forRootAsync()` method. As with most dynamic modules, Nest provides several techniques to deal with async configuration.

One technique is to use a factory function:

```typescript
ClusterIpcModule.forRootAsync({
  useFactory: () => ({
    requestTimeout: 5000,
  }),
});
```

Like other factory providers, our factory function can be [async](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory) and can inject dependencies through `inject`.

```typescript
ClusterIpcModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    requestTimeout: configService.get('CLUSTER_IPC_REQUEST_TIMEOUT'),
  }),
  inject: [ConfigService],
});
```

Alternatively, you can configure the `ClusterIpcModule` using a class instead of a factory, as shown below.

```typescript
ClusterIpcModule.forRootAsync({
  useClass: ClusterIpcConfigService,
});
```

The construction above instantiates `ClusterIpcConfigService` inside `ClusterIpcModule`, using it to create an options object. Note that in this example, the `ClusterIpcConfigService` has to implement `ClusterIpcModuleOptionsFactory` interface as shown below. The `ClusterIpcModule` will call the `createClusterIpcOptions()` method on the instantiated object of the supplied class.

```typescript
@Injectable()
class ClusterIpcConfigService implements ClusterIpcModuleOptionsFactory {
  createClusterIpcOptions(): ClusterIpcModuleOptions {
    return {
      requestTimeout: 5000,
    };
  }
}
```

If you want to reuse an existing options provider instead of creating a private copy inside the `ClusterIpcModule`, use the `useExisting` syntax.

```typescript
ClusterIpcModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ClusterIpcConfigService,
});
```

## Example

A working example is available [here](example).

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/nest-cluster-ipc.svg
[npm-url]: https://npmjs.com/package/nest-cluster-ipc
