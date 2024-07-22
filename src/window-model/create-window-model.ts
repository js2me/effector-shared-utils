import { createEvent, createStore, sample } from 'effector';
import { empty, not } from 'patronum';

import { OpenWindowPayload, WindowModel } from './types';

export const createWindowModel = (): WindowModel => {
  const $window = createStore<Window | null>(null);

  const open = createEvent<OpenWindowPayload>();
  const close = createEvent();

  const reset = createEvent();

  sample({
    clock: open,
    fn: ({ url, target }) => window.open(url, target),
    target: $window,
  });

  sample({
    clock: close,
    source: $window,
    fn: (window) => {
      window?.close();
      return null;
    },
    target: $window,
  });

  const $exist = not(empty($window));

  sample({
    clock: reset,
    target: close,
  });

  return {
    open,
    close,
    reset,
    $window,
    $exist,
  };
};
