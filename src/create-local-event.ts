import { createEvent, Event } from 'effector';

/**
 * Создает простейшую обертку над событием, которое создано этой функции внутри,
 * позволяет изолировать дальнейшее поведение вызова этого события внутри функции-аргумента
 */
export const createLocalEvent = <Payload = void>(
  fn?: (e: Event<Payload>) => void,
) => {
  const event = createEvent<Payload>();
  fn?.(event);
  return event;
};
