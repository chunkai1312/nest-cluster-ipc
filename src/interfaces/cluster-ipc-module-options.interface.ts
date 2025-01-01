import { ModuleMetadata, Type } from '@nestjs/common';

export interface ClusterIPCModuleOptions {}

export interface ClusterIPCModuleOptionsFactory {
  createClusterIPCOptions(): Promise<ClusterIPCModuleOptions> | ClusterIPCModuleOptions;
}

export interface ClusterIPCModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ClusterIPCModuleOptionsFactory>;
  useClass?: Type<ClusterIPCModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ClusterIPCModuleOptions> | ClusterIPCModuleOptions;
  inject?: any[];
}
