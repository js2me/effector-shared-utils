import {
  createEffect,
  createEvent,
  createStore,
  restore,
  sample,
} from 'effector';
import { delay, not } from 'patronum';

import {
  CloseSocketPayload,
  SendSocketMessagePayload,
  SocketModel,
  SocketModelConfig,
} from './types';

export const createSocketModel = <
  MessageType extends AnyObject,
  Payload = void,
>({
  url,
  protocols = [],
  defaultCloseCode = 1000,
  reconnect,
  skipReconnectCodes = [1001, 1005],
  reconnectTimeout = 1000,
}: SocketModelConfig<Payload>): SocketModel<MessageType, Payload> => {
  const $socket = createStore<WebSocket | null>(null);
  const $socketOpened = createStore(false);
  const $socketClosed = not($socketOpened);
  const onSocketMessage = createEvent<MessageType>();
  const onPrevSocketMessage = createEvent<MessageType>();
  const onSocketError = createEvent<Event>();
  const onSocketOpen = createEvent<Event>();
  const onSocketClose = createEvent<CloseEvent>();

  const openSocket = createEvent<Payload>();
  const closeSocket = createEvent<number | void>();
  const sendSocketMessage = createEvent<Record<string, unknown>>();

  const $socketPayload = restore(
    openSocket.map((it) => it || null),
    null,
  );

  const createSocketFx = createEffect<
    { existingSocket?: void | WebSocket | null; payload?: Payload },
    WebSocket
  >(({ existingSocket, payload }) => {
    if (existingSocket) {
      existingSocket.onclose = null;
      existingSocket.onopen = null;
      existingSocket.onerror = null;
      existingSocket.onmessage = (message) => {
        try {
          onPrevSocketMessage(JSON.parse(message.data));
        } catch (e) {
          console.error(
            'failed to parse socket message data:\n',
            message.data,
            '\n',
            'error:',
            e,
          );
          return message.data;
        }
      };
    }

    const socket = new WebSocket(
      typeof url === 'function' ? url(payload!) : url,
      protocols,
    );
    socket.onclose = onSocketClose;
    socket.onopen = onSocketOpen;
    socket.onerror = onSocketError;
    socket.onmessage = (message) => {
      try {
        onSocketMessage(JSON.parse(message.data));
      } catch (e) {
        console.error(
          'failed to parse socket message data:\n',
          message.data,
          '\n',
          'error:',
          e,
        );
        return message.data;
      }
    };
    return socket;
  });

  const closeSocketFx = createEffect<CloseSocketPayload, void>(
    ({ socket, code }) => {
      socket.close(code || defaultCloseCode);
    },
  );

  const sendSocketMessageFx = createEffect<SendSocketMessagePayload, void>(
    ({ socket, data }) => {
      data = Array.isArray(data) ? data : [data];
      data.forEach((data) => {
        socket.send(JSON.stringify(data));
      });
    },
  );

  sample({
    clock: onPrevSocketMessage,
    target: onSocketMessage,
  });

  sample({
    source: $socket,
    clock: [
      sendSocketMessage,
      onSocketError,
      onSocketOpen,
      onSocketClose,
      closeSocketFx.finally,
      createSocketFx.finally,
    ],
    fn: (socket) => !!socket && socket.readyState === WebSocket.OPEN,
    target: $socketOpened,
  });

  sample({
    clock: openSocket,
    fn: (payload) => ({ payload }),
    target: createSocketFx,
  });

  sample({
    source: sample({
      source: $socket,
      clock: closeSocket,
      fn: (socket, code): CloseSocketPayload | null => {
        if (!socket) return null;

        return {
          socket,
          code: code ?? null,
        };
      },
    }),
    filter: Boolean,
    target: closeSocketFx,
  });

  if (reconnect) {
    const reconnectSocket = createEvent<unknown>();

    // реконнект
    delay({
      source: sample({
        clock: [
          sample({
            source: onSocketClose,
            filter: (e) => !skipReconnectCodes.includes(e.code),
          }),
          sample({
            source: onSocketError,
            filter: (e) => e && 'code' in e && e.code === 'ECONNREFUSED',
          }),
        ],
      }),
      timeout: reconnectTimeout,
      target: reconnectSocket,
    });

    sample({
      source: [$socket, $socketPayload] as const,
      clock: reconnectSocket,
      fn: ([socket, payload]) => ({
        existingSocket: socket,
        payload: payload || void 0,
      }),
      target: createSocketFx,
    });
  }

  sample({
    source: sample({
      source: [$socket, $socketOpened] as const,
      clock: sendSocketMessage,
      fn: ([socket, opened], data): SendSocketMessagePayload | null => {
        if (!socket || !opened) return null;

        return {
          socket,
          data,
        };
      },
    }),
    filter: Boolean,
    target: sendSocketMessageFx,
  });

  sample({
    source: createSocketFx.doneData,
    target: $socket,
  });

  return {
    $socket,
    $isOpened: $socketOpened,
    $isClosed: $socketClosed,
    messageReceived: onSocketMessage,
    errored: onSocketError,
    opened: onSocketOpen,
    closed: onSocketClose,
    open: openSocket,
    close: closeSocket,
    sendMessage: sendSocketMessage,
  };
};
