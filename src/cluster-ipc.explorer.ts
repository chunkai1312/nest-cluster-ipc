import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClusterIpc } from 'node-cluster-ipc';
import { ClusterIpcMetadataAccessor } from './cluster-ipc-metadata.accessor';
import { CLUSTER_IPC_INSTANCE } from './cluster-ipc.constants';

@Injectable()
export class ClusterIpcExplorer implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(CLUSTER_IPC_INSTANCE) private readonly clusterIpc: ClusterIpc,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ClusterIpcMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) { }

  onApplicationBootstrap() {
    this.loadClusterIpcListeners();
  }

  onApplicationShutdown() {
    this.clusterIpc.removeAllListeners();
  }

  loadClusterIpcListeners() {
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
            this.subscribeToClusterIpcIfListener(instance, methodKey),
        );
      });
  }

  private subscribeToClusterIpcIfListener(instance: Record<string, any>, methodKey: string) {
    const clusterIpcListenerMetadata = this.metadataAccessor.getClusterIpcListenerMetadata(instance[methodKey]);
    if (!clusterIpcListenerMetadata) return;

    const { event, channel } = clusterIpcListenerMetadata;
    const listenerMethod = this.clusterIpc.on.bind(this.clusterIpc);

    listenerMethod(event, (channe: string, ...args: unknown[]) => {
      if (channe === channel) instance[methodKey].call(instance, ...args);
    });
  }
}
