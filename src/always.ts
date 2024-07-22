import { createStore, Store } from 'effector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map = new Map<any, Store<any>>();

export const always = <T>(value: T): Store<T> => {
  if (!map.has(value)) {
    map.set(value, createStore(value, { skipVoid: false }));
  }
  return map.get(value)!;
};
