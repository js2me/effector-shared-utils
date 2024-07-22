import { createEvent, EventCallable, sample, Store } from 'effector';
import { not } from 'patronum';

import {
  ValueModelBase,
  ValueModelCfgBase,
  ValueModelUnitShape,
} from '../types';

import { createSimpleModel } from './simple-model';

/**
 * Создает модель списка данных, с необходимыми для списка событиями Список содержит уникальные значение
 */
export interface ListModel<T extends unknown[]> extends ValueModelBase<T> {
  /**
   * Размер списка
   */
  $size: Store<number>;
  /**
   * Пустой список или нет
   */
  $empty: Store<boolean>;
  /**
   * Добавить значение в лист если его нет
   */
  add: EventCallable<T[number]>;
  /**
   * Добавить значение в лист если его нет
   * Убирает значение в листе если оно есть
   */
  toggle: EventCallable<T[number]>;
  /**
   * Удаляет значение из листа
   */
  delete: EventCallable<T[number]>;

  '@@unitShape': ValueModelUnitShape<ListModel<T>>;
}

export const createListModel = <T extends unknown[]>(
  defaultState: T,
  cfg: ValueModelCfgBase<T, 'list'>,
): ListModel<T> => {
  const initial = (defaultState ?? []) as T;

  const model = createSimpleModel<T>(initial, {
    ...(cfg as unknown as ValueModelCfgBase<T, 'simple'>),
  });

  const addEvent = createEvent<T[number]>();
  const toggleEvent = createEvent<T[number]>();
  const deleteEvent = createEvent<T[number]>();

  const $size = model.$value.map((state) => state.length);
  const $empty = not($size.map(Boolean));

  sample({
    clock: addEvent,
    source: model.$value,
    fn: (state, value): T => {
      if (!state.includes(value)) {
        return [...state, value] as T;
      }
      return state;
    },
    target: model.set,
  });

  sample({
    clock: toggleEvent,
    source: model.$value,
    fn: (state, value): T => {
      if (state.includes(value)) {
        return state.filter((it) => it !== value) as T;
      }
      return [...state, value] as T;
    },
    target: model.set,
  });

  sample({
    clock: deleteEvent,
    source: model.$value,
    fn: (state, value): T => {
      if (!state.includes(value)) {
        return state;
      }
      return state.filter((key) => key !== value) as T;
    },
    target: model.set,
  });

  Object.assign(model.__.unitShape, {
    size: $size,
    empty: $empty,
    add: addEvent,
    delete: deleteEvent,
    toggle: toggleEvent,
  });

  return {
    ...model,
    $size,
    $empty,
    add: addEvent,
    delete: deleteEvent,
    toggle: toggleEvent,

    '@@unitShape': model['@@unitShape'] as ValueModelUnitShape<ListModel<T>>,
  };
};
