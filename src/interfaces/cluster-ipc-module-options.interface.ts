import { ModuleMetadata, Type } from '@nestjs/common';

export interface ClusterIpcModuleOptions {
  requestTimeout?: number;
}

export interface ClusterIpcModuleOptionsFactory {
  createClusterIpcOptions(): Promise<ClusterIpcModuleOptions> | ClusterIpcModuleOptions;
}

export interface ClusterIpcModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ClusterIpcModuleOptionsFactory>;
  useClass?: Type<ClusterIpcModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ClusterIpcModuleOptions> | ClusterIpcModuleOptions;
  inject?: any[];
}
