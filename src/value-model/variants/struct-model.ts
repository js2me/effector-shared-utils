import { createEvent, EventCallable, sample, Store } from 'effector';
import { empty } from 'patronum';

import {
  ValueModelBase,
  ValueModelCfgBase,
  ValueModelUnitShape,
} from '../types';

import { createSimpleModel } from './simple-model';

/**
 * Модель работы с boolean значением
 */
export interface StructModel<T> extends ValueModelBase<T> {
  update: EventCallable<ValueModelUpdate<T>>;

  $empty: Store<boolean>;

  '@@unitShape': ValueModelUnitShape<StructModel<T>>;
}

type StateHandler<T> = (prev: T) => NonNullable<T>;
type ValueModelUpdate<T> = Partial<T> | StateHandler<T>;

export const createStructModel = <T extends AnyObject>(
  defaultState: T,
  cfg: ValueModelCfgBase<T, 'struct'>,
): StructModel<T> => {
  const model = createSimpleModel<T>(defaultState, {
    ...(cfg as unknown as ValueModelCfgBase<T, 'simple'>),
  });

  const update = createEvent<ValueModelUpdate<T>>();

  const $empty = empty(model.$value);

  sample({
    clock: update,
    source: model.$value,
    fn: (value, updateOrHandler): T => {
      if (typeof updateOrHandler === 'function') {
        return updateOrHandler(value);
      }

      if (Array.isArray(updateOrHandler)) {
        return [...updateOrHandler] as unknown as T;
      }

      if (typeof updateOrHandler === 'object') {
        return { ...value, ...updateOrHandler } as T;
      }

      return updateOrHandler;
    },
    target: model.set,
  });

  Object.assign(model.__.unitShape, {
    update,
    empty: $empty,
  });

  return {
    ...model,
    update,
    $empty,

    '@@unitShape': model['@@unitShape'] as ValueModelUnitShape<StructModel<T>>,
  };
};
