import { combine, createEvent, Event, sample, Store } from 'effector';
import { not } from 'patronum';

import { createValueModel } from './value-model';

interface ProtectEventCfg<T> {
  event: Event<T>;
  if: Store<boolean>;
}

/**
 * Создает новое событие, которые будет сработано только в случае если <if> условие будет иметь истинниое значение
 * Если входящее событие было вызвано, тогда когда <if> условие не было истинно, то пейлоад этого события аккумулуриется и ждет момент когда <if> будет истино
 *
 * @example
 * ```ts
 * const inputEvent = createEvent()
 * const $condition = createStore(false);
 *
 * const protectedEvent = protectEvent({
 *  event: inputEvent,
 *  if: $condition,
 * })
 *
 * inputEvent(1); // protectedEvent не будет вызван
 * inputEvent(2); // protectedEvent не будет вызван
 *
 * $condition.setState(true); // protectedEvent будет вызыван два раза
 * ```
 */
export const protectEvent = <T>(cfg: ProtectEventCfg<T>): Event<T> => {
  const cachedPayloads = createValueModel<T>([], { type: 'list' });
  const protectedEvent = createEvent<T>();

  sample({
    clock: cfg.event,
    filter: not(cfg.if),
    target: cachedPayloads.add,
  });

  sample({
    clock: cfg.event,
    filter: cfg.if,
    target: protectedEvent,
  });

  combine(cfg.if, cachedPayloads.$value).watch(([condition, payloads]) => {
    if (condition) {
      payloads.forEach((payload) => {
        protectedEvent(payload);
      });
      payloads.splice(0, payloads.length);
    }
  });

  return protectedEvent;
};
