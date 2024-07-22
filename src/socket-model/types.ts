import { EventCallable as EffectorEvent, Store } from 'effector';

export interface SendSocketMessagePayload {
  socket: WebSocket;
  data: Record<string, unknown> | Record<string, unknown>[];
}

export interface CloseSocketPayload {
  socket: WebSocket;
  code: number | null;
}

export type SocketModelConfig<Payload = void> = {
  url: string | ((payload: Payload) => string);
  defaultCloseCode?: number;
  protocols?: string[];
  reconnect?: boolean;
  reconnectTimeout?: number;
  skipReconnectCodes?: number[];
};

export interface SocketModel<
  MessageType extends Record<string, unknown>,
  Payload = void,
> {
  /**
   * Инстанс сокета
   */
  $socket: Store<WebSocket | null>;
  /**
   * Сокет открыт
   */
  $isOpened: Store<boolean>;
  /**
   * Сокет закрыт
   */
  $isClosed: Store<boolean>;
  /**
   * Когда пришло сообщение по сокету
   */
  messageReceived: EffectorEvent<MessageType>;
  /**
   * Когда сокет был открыт
   */
  opened: EffectorEvent<Event>;
  /**
   * Когда сокет выдал ошибку и был закрыт
   */
  errored: EffectorEvent<Event>;
  /**
   * Когда сокет был закрыт
   */
  closed: EffectorEvent<CloseEvent>;
  /**
   * Открыть сокет соединение
   */
  open: EffectorEvent<Payload>;
  /**
   * Закрыть сокет соединение
   */
  close: EffectorEvent<number | void>;
  /**
   * Отправить сообщение по сокету
   */
  sendMessage: EffectorEvent<Record<string, unknown>>;
}
