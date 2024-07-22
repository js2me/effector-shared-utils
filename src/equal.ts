import { combine, createStore, is, Store } from 'effector';

export const equals = <T>(...storeOrValues: (T | Store<T>)[]) => {
  const $stores = storeOrValues.map(
    (value): Store<unknown> =>
      is.store(value) ? value : (createStore(value) as Store<unknown>),
  );

  return combine($stores, (states) => {
    let lastState = states[0];
    for (const state of states) {
      if (state !== lastState) {
        return false;
      }
      lastState = state;
    }
    return true;
  });
};
