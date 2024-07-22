import { createStore } from 'effector';
import { createStorage, StorageType } from 'yammies/storage';

export interface CreateCachedStoreConfig {
  key: string;
  type: StorageType;
  namespace?: string;
  prefix?: string;
}

const storage = createStorage({ prefix: '$cached-stores' });

export const createCachedStore = <T>(
  initialValue: T,
  storageCfg: CreateCachedStoreConfig,
  storeCfg?: {
    updateFilter?: (update: T, current: T) => boolean;
    skipVoid?: boolean;
  },
) => {
  const key = `${storageCfg.key}`;
  const stored = storage.get<T>({
    ...storageCfg,
    key,
  });
  const $store = createStore<T>(
    stored == null ? initialValue : stored,
    storeCfg,
  );

  $store.watch((value) => {
    storage.set({ ...storageCfg, key, value });
  });

  return $store;
};
