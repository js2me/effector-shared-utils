import { EventCallable, Store } from 'effector';

import { CreateCachedStoreConfig } from '../cached-store';

export type ValueModelType =
  /**
   * Список (array like)
   */
  | 'list'
  /**
   * Переключатель (boolean like)
   */
  | 'switch'
  /**
   * Структура (object like)
   */
  | 'struct'
  /**
   * Числовой
   */
  | 'numeric'
  /**
   * Простая модель, не имеющая доп. методов и свойств
   */
  | 'simple';

export interface ValueModelCfgBase<UsedType, ModelType extends ValueModelType> {
  /**
   * Тип модели
   */
  type?: ModelType;
  /**
   * Кэширование
   */
  cache?: CreateCachedStoreConfig;
  /**
   * 'strict' - строгое обновление стора (используется deep equal сравнение текущего и нового состояний)
   * 'shallow-equal' - обычное обновление стора
   */
  update?: 'strict' | 'shallow-equal';
  /**
   * предобработка значения перед заполнением его в стор
   */
  transform?: (value: UsedType) => UsedType;
}

export interface ValueModelBase<T> {
  /**
   * Значение
   */
  $value: Store<T>;
  /**
   * Установить значение
   */
  set: EventCallable<T>;
  /**
   * Сбрасывает всё в модели
   */
  reset: EventCallable<void>;
}

export type ValueModelUnitShape<T extends AnyObject> = () => {
  [K in keyof Omit<T, '@@unitShape' | '__'> as K extends `$${infer VV}`
    ? VV
    : K]: T[K];
};
