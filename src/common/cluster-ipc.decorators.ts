import { Inject, SetMetadata } from '@nestjs/common';
import { CLUSTER_IPC_INSTANCE, CLUSTER_IPC_LISTENER_METADATA } from '../cluster-ipc.constants';

export const InjectClusterIpc = (): ParameterDecorator => {
  return Inject(CLUSTER_IPC_INSTANCE);
};

export const OnMessage = (): MethodDecorator => {
  return SetMetadata(CLUSTER_IPC_LISTENER_METADATA, { event: 'message' });
};
