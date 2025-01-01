import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClusterIPC } from 'node-cluster-ipc';
import { ClusterIPCMetadataAccessor } from './cluster-ipc-metadata.accessor';
import { CLUSTER_IPC_INSTANCE } from './cluster-ipc.constants';

@Injectable()
export class ClusterIPCExplorer implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(CLUSTER_IPC_INSTANCE) private readonly clusterIPC: ClusterIPC,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ClusterIPCMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) { }

  onApplicationBootstrap() {
    this.loadClusterIPCListeners();
  }

  onApplicationShutdown() {
    this.clusterIPC.removeAllListeners();
  }

  loadClusterIPCListeners() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    [...providers, ...controllers]
      .filter(wrapper => wrapper.isDependencyTreeStatic())
      .filter(wrapper => wrapper.instance)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance) || {};
        this.metadataScanner.scanFromPrototype(
          instance,
          prototype,
          (methodKey: string) =>
            this.subscribeToClusterIPCIfListener(instance, methodKey),
        );
      });
  }

  private subscribeToClusterIPCIfListener(instance: Record<string, any>, methodKey: string) {
    const clusterIPCListenerMetadata = this.metadataAccessor.getClusterIPCListenerMetadata(instance[methodKey]);
    if (!clusterIPCListenerMetadata) return;

    const { event } = clusterIPCListenerMetadata;
    const listenerMethod = this.clusterIPC.on.bind(this.clusterIPC);

    listenerMethod(event, (...args: unknown[]) => instance[methodKey].call(instance, ...args));
  }
}
