import { Event, EventCallable, Store } from 'effector';

import { CreateCachedStoreConfig } from '../cached-store';

export interface CounterConfig {
  initial?: number;
  max?: number;
  cache?: CreateCachedStoreConfig;
}

export interface CounterModel {
  $value: Store<number>;

  reset: EventCallable<void>;
  increment: EventCallable<void>;

  onNextTick: Event<void>;
  onLimit: Event<void>;
}
