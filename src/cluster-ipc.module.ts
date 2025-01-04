import { Module, DynamicModule, Provider, Global, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CLUSTER_IPC_INSTANCE, CLUSTER_IPC_OPTIONS } from './cluster-ipc.constants';
import { ClusterIpc } from 'node-cluster-ipc';
import { ClusterIpcExplorer } from './cluster-ipc.explorer';
import { ClusterIpcMetadataAccessor } from './cluster-ipc-metadata.accessor';
import { ClusterIpcModuleAsyncOptions, ClusterIpcModuleOptions, ClusterIpcModuleOptionsFactory } from './interfaces';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ClusterIpcExplorer, ClusterIpcMetadataAccessor],
})
export class ClusterIpcModule {
  static forRoot(options?: ClusterIpcModuleOptions): DynamicModule {
    return {
      module: ClusterIpcModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: CLUSTER_IPC_INSTANCE,
          useValue: new ClusterIpc(options),
        },
      ],
      exports: [CLUSTER_IPC_INSTANCE],
    };
  }

  static forRootAsync(options?: ClusterIpcModuleAsyncOptions): DynamicModule {
    return {
      module: ClusterIpcModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: CLUSTER_IPC_INSTANCE,
          useFactory: (options: ClusterIpcModuleOptions) => new ClusterIpc(options),
          inject: [CLUSTER_IPC_INSTANCE],
        },
      ],
      exports: [CLUSTER_IPC_INSTANCE],
    };
  }

  private static createAsyncProviders(options: ClusterIpcModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<ClusterIpcModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: ClusterIpcModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CLUSTER_IPC_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<ClusterIpcModuleOptionsFactory>,
    ];
    return {
      provide: CLUSTER_IPC_OPTIONS,
      useFactory: async (optionsFactory: ClusterIpcModuleOptionsFactory) =>
        await optionsFactory.createClusterIpcOptions(),
      inject,
    };
  }
}
