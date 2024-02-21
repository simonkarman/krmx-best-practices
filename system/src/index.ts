export * from './utils/system';
export * from './custom-system';

import { createCustomSystem } from './custom-system';
import { System } from './utils/system';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractReturnTypes<T extends readonly ((i: any) => any)[]> = [
  ... {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T]: T[K] extends ((i: any) => infer R) ? R : never
  }
][number];

export type Action = ExtractReturnTypes<ReturnType<typeof createCustomSystem>['actions']>;
export type SystemState = ReturnType<typeof createCustomSystem>['system'] extends System<infer X> ? X : never;
