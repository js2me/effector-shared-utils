import { Store } from 'effector';

export const syncWithHtmlAttribute = <T>(cfg: {
  source: Store<T>;
  key: string;
  value?: (state: T) => Maybe<string>;
  element?: HTMLElement;
}) => {
  const targetElement = cfg.element || document.documentElement;

  cfg.source.watch((state) => {
    const value = cfg.value ? cfg.value(state) : state;
    if (value == null && cfg.value) {
      targetElement.removeAttribute(cfg.key);
    } else {
      targetElement.setAttribute(cfg.key, `${value}`);
    }
  });
};
