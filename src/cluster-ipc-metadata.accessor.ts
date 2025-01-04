import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLUSTER_IPC_LISTENER_METADATA } from './cluster-ipc.constants';
import { ListenerMetadata } from './interfaces';

@Injectable()
export class ClusterIpcMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getClusterIpcListenerMetadata(target: Type<unknown>): ListenerMetadata | undefined {
    return this.reflector.get(CLUSTER_IPC_LISTENER_METADATA, target);
  }
}
