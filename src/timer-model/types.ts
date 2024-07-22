import { Event, EventCallable, Store } from 'effector';

export interface TimerModelConfig {
  /**
   * Время тика (ms)
   *
   * @example
   * tickDelay - 300 (ms)
   * maxTicks - 30
   *
   * каждые 300 ms будет вызываться тик у таймера, до тех пор пока не будет достигнут лимит (30)
   */
  tickDelay: number;
  /**
   * Максимальное количество тиков, которые выполнит таймер
   */
  maxTicks?: number | Store<number>;
}

/**
 * Таймер с тиками
 */
export interface TimerModel {
  $running: Store<boolean>;
  $finished: Store<boolean>;
  $ticks: Store<number>;
  $ticksLeft: Store<number>;
  $ticksMs: Store<number>;

  start: EventCallable<void>;
  stop: EventCallable<void>;
  finished: Event<void>;
  tick: Event<void>;
}
