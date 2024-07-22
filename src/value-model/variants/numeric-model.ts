import { createEvent, EventCallable, is, sample, Store } from 'effector';
import { clamp } from 'lodash-es';

import { always } from '../../always';
import {
  ValueModelBase,
  ValueModelCfgBase,
  ValueModelUnitShape,
} from '../types';

import { createSimpleModel } from './simple-model';

/**
 * Модель работы с boolean значением
 */
export interface NumericModel<T extends number> extends ValueModelBase<T> {
  increment: EventCallable<void>;
  decrement: EventCallable<void>;

  '@@unitShape': ValueModelUnitShape<NumericModel<T>>;
}

export interface NumericModelCfg<T extends number>
  extends ValueModelCfgBase<T, 'numeric'> {
  max?: number | Store<number>;
  min?: number | Store<number>;
}

export const createNumericModel = <T extends number>(
  defaultState: T,
  cfg: NumericModelCfg<T>,
): NumericModel<T> => {
  const model = createSimpleModel<T>(defaultState as T, {
    ...(cfg as unknown as ValueModelCfgBase<T, 'simple'>),
  });

  const set = createEvent<T>();
  const increment = createEvent();
  const decrement = createEvent();

  sample({
    clock: increment,
    source: model.$value,
    fn: (value) => (value + 1) as T,
    target: set,
  });

  sample({
    clock: decrement,
    source: model.$value,
    fn: (value) => (value - 1) as T,
    target: set,
  });

  if (cfg.min != null || cfg.max != null) {
    const $min = is.store(cfg.min) ? cfg.min : always(cfg.min ?? -Infinity);
    const $max = is.store(cfg.max) ? cfg.max : always(cfg.max ?? Infinity);

    sample({
      clock: set,
      source: [$min, $max] as const,
      fn: ([min, max], value) => clamp(value, min, max) as T,
      target: model.set,
    });
  } else {
    sample({
      clock: set,
      target: model.set,
    });
  }

  Object.assign(model.__.unitShape, {
    increment,
    decrement,
  });

  return {
    ...model,
    set,
    increment,
    decrement,

    '@@unitShape': model['@@unitShape'] as ValueModelUnitShape<NumericModel<T>>,
  };
};
