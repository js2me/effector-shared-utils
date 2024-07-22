import { combine, createEvent, is, sample } from 'effector';
import { noop } from 'lodash-es';
import { typeGuard } from 'yammies/type-guard';

import { always } from '../always';
import { createValueModel } from '../value-model';
import { when } from '../when';

import { TimerModel, TimerModelConfig } from './types';

export const createTimerModel = ({
  tickDelay: tickDelay,
  maxTicks: maxTicksCount,
}: TimerModelConfig): TimerModel => {
  let timerId: number | undefined;

  const ticks = createValueModel(0, { type: 'numeric' });
  const running = createValueModel(false, { type: 'switch' });

  const $ticksMs = ticks.$value.map(
    (ticks) => +(ticks * tickDelay).toFixed(10),
  );

  const unsafeTick = createEvent();

  const $limit = is.store(maxTicksCount)
    ? maxTicksCount
    : always(maxTicksCount ?? Infinity);

  const $ticksLeft = combine(ticks.$value, $limit, (ticks, limit) => {
    if (typeGuard.isInfinite(limit)) return Infinity;

    return Math.max(limit - ticks, 0);
  });

  const $finished = combine(
    running.$on,
    ticks.$value,
    (running, ticks) => !running && ticks !== 0,
  );

  const createTimeout = () => {
    clearTimeout(timerId);
    new Promise<void>((res) => {
      clearTimeout(timerId);
      timerId = setTimeout(res, tickDelay);
    }).then(() => {
      clearTimeout(timerId);
      unsafeTick();
    });
  };

  const tick = sample({
    clock: unsafeTick,
    filter: running.$on,
    fn: noop,
  });

  sample({
    clock: running.turnOn,
    target: ticks.reset,
  });

  sample({
    clock: tick,
    target: ticks.increment,
  });

  running.turnOn.watch(() => {
    clearTimeout(timerId);
    createTimeout();
  });

  running.turnOff.watch(() => {
    clearTimeout(timerId);
  });

  tick.watch(() => {
    createTimeout();
  });

  if ($limit) {
    sample({
      clock: ticks.$value,
      source: $limit,
      filter: (limit, ticks) => ticks >= limit,
      target: running.turnOff,
    });
  }
  //
  // debug({
  //   tick,
  //   $finished,
  //   'running.$on': running.$on,
  //   'ticks.$value': ticks.$value,
  //   $ticksLeft,
  //   $ticksMs,
  //   start: running.turnOn,
  //   stop: running.turnOff,
  //   finished: when($finished),
  // });

  return {
    $running: running.$on,
    $finished,
    $ticks: ticks.$value,
    $ticksLeft,
    $ticksMs,

    start: running.turnOn,
    stop: running.turnOff,
    finished: when($finished),
    tick,
  };
};
