/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValueModelCfgBase, ValueModelType } from './types';
import {
  createListModel,
  createNumericModel,
  createSimpleModel,
  createStructModel,
  createSwitchModel,
  ListModel,
  NumericModel,
  NumericModelCfg,
  SimpleModel,
  StructModel,
  SwitchModel,
} from './variants';

export function createValueModel<T>(
  defaultState: T,
  cfg?: ValueModelCfgBase<T, 'simple'>,
): SimpleModel<T>;

export function createValueModel<T>(
  defaultState: T[],
  cfg: ValueModelCfgBase<T[], 'list'>,
): ListModel<T[]>;

export function createValueModel<T>(
  defaultState: T,
  cfg: ValueModelCfgBase<T, 'struct'>,
): StructModel<T>;

export function createValueModel(
  defaultState: boolean,
  cfg: ValueModelCfgBase<boolean, 'switch'>,
): SwitchModel<boolean>;

export function createValueModel(
  defaultState: number,
  cfg: NumericModelCfg<number>,
): NumericModel<number>;

export function createValueModel<T>(
  defaultState: unknown,
  cfg?: ValueModelCfgBase<T, ValueModelType>,
): AnyObject {
  switch (cfg?.type) {
    case 'list':
      return createListModel<any>(defaultState, cfg as any);
    case 'switch':
      return createSwitchModel<any>(defaultState, cfg as any);
    case 'struct':
      return createStructModel<any>(defaultState, cfg as any);
    case 'numeric':
      return createNumericModel<any>(defaultState, cfg as any);
    default: {
      return createSimpleModel<any>(defaultState, cfg as any);
    }
  }
}
