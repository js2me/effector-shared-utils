import { createEvent, Event, EventCallable, sample, Store } from 'effector';
import { not } from 'patronum';

import { when } from '../../when';
import {
  ValueModelBase,
  ValueModelCfgBase,
  ValueModelUnitShape,
} from '../types';

import { createSimpleModel } from './simple-model';

/**
 * Модель работы с boolean значением
 */
export interface SwitchModel<T extends boolean> extends ValueModelBase<T> {
  /**
   * Включен ли переключатель
   */
  $on: Store<boolean>;
  /**
   * Выключен ли переключатель
   */
  $off: Store<boolean>;
  /**
   * Переключить
   * true -> false
   * false -> true
   */
  toggle: EventCallable<void>;
  /**
   * Включить (* -> true)
   */
  turnOn: EventCallable<void>;
  /**
   * Выключить (* -> false)
   */
  turnOff: EventCallable<void>;

  /**
   * Было включено
   */
  turnedOn: Event<void>;

  /**
   * Было выключено
   */
  turnedOff: Event<void>;

  '@@unitShape': ValueModelUnitShape<
    Omit<SwitchModel<T>, 'turnedOff' | 'turnedOn'>
  >;
}

export const createSwitchModel = <T extends boolean>(
  defaultState: T,
  cfg: ValueModelCfgBase<T, 'switch'>,
): SwitchModel<T> => {
  const model = createSimpleModel<T>((defaultState ?? false) as T, {
    ...(cfg as unknown as ValueModelCfgBase<T, 'simple'>),
  });

  const $on = model.$value;
  const $off = not($on);

  const toggle = createEvent();
  const turnOn = createEvent();
  const turnOff = createEvent();

  const turnedOn = when($on);
  const turnedOff = when($off);

  sample({
    clock: turnOn,
    fn: () => true as T,
    target: model.set,
  });

  sample({
    clock: turnOff,
    fn: () => false as T,
    target: model.set,
  });

  sample({
    clock: toggle,
    source: model.$value,
    fn: (value) => !value as T,
    target: model.set,
  });

  Object.assign(model.__.unitShape, {
    on: $on,
    off: $off,
    toggle,
    turnOn,
    turnOff,
  });

  return {
    ...model,
    $on,
    $off,
    toggle,
    turnOn,
    turnOff,
    turnedOn,
    turnedOff,

    '@@unitShape': model['@@unitShape'] as SwitchModel<T>['@@unitShape'],
  };
};
