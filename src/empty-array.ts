import { Store } from 'effector';

export const emptyArray = <T>($store: Store<T[]>): Store<boolean> =>
  $store.map((state) => !state || !state.length);
