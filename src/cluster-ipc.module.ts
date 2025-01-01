import { Module, DynamicModule, Provider, Global, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { CLUSTER_IPC_INSTANCE, CLUSTER_IPC_OPTIONS } from './cluster-ipc.constants';
import { ClusterIPC } from 'node-cluster-ipc';
import { ClusterIPCExplorer } from './cluster-ipc.explorer';
import { ClusterIPCMetadataAccessor } from './cluster-ipc-metadata.accessor';
import { ClusterIPCModuleAsyncOptions, ClusterIPCModuleOptions, ClusterIPCModuleOptionsFactory } from './interfaces';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [ClusterIPCExplorer, ClusterIPCMetadataAccessor],
})
export class ClusterIPCModule {
  static forRoot(options?: ClusterIPCModuleOptions): DynamicModule {
    return {
      module: ClusterIPCModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: CLUSTER_IPC_INSTANCE,
          useValue: new ClusterIPC(),
        },
      ],
      exports: [CLUSTER_IPC_INSTANCE],
    };
  }

  static forRootAsync(options?: ClusterIPCModuleAsyncOptions): DynamicModule {
    return {
      module: ClusterIPCModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: CLUSTER_IPC_INSTANCE,
          useFactory: (options: ClusterIPCModuleOptions) => new ClusterIPC(),
          inject: [CLUSTER_IPC_INSTANCE],
        },
      ],
      exports: [CLUSTER_IPC_INSTANCE],
    };
  }

  private static createAsyncProviders(options: ClusterIPCModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<ClusterIPCModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: ClusterIPCModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CLUSTER_IPC_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<ClusterIPCModuleOptionsFactory>,
    ];
    return {
      provide: CLUSTER_IPC_OPTIONS,
      useFactory: async (optionsFactory: ClusterIPCModuleOptionsFactory) =>
        await optionsFactory.createClusterIPCOptions(),
      inject,
    };
  }
}
