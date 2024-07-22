import { EventCallable, Store } from 'effector';

export interface WindowModel {
  open: EventCallable<OpenWindowPayload>;
  close: EventCallable<void>;
  reset: EventCallable<void>;
  $window: Store<Window | null>;
  $exist: Store<boolean>;
}

export interface OpenWindowPayload {
  url: string;
  target: '_self' | '_blank' | 'blank' | '_parent' | '_parent';
}
