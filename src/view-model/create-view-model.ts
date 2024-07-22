import { createEvent, createStore, restore } from 'effector';
import { and, not } from 'patronum';

import { when } from '../when';

import { connectHOC } from './connect-hoc';
import { connectHook } from './connect-hook';
import type {
  CreateViewModelConfig,
  ViewModel,
  ViewModelInternal,
} from './types';

export const createViewModel = <
  Events extends AnyObject,
  RouteParams extends AnyObject,
>({
  events = {} as Events,
  route,
  parent,
}: CreateViewModelConfig<Events, RouteParams> = {}): ViewModel<Events> => {
  const setMounted = createEvent<boolean>();
  const $mounted = restore(setMounted, false);
  const $isRouteOpened = route ? route.$isOpened : createStore(true);
  const $isParentMounted = parent ? parent.$mounted : createStore(true);

  const $connected = and($mounted, $isRouteOpened, $isParentMounted);

  const viewModel: ViewModelInternal<Events> = {
    $mounted: $connected,
    onMounted: when($connected),
    onUnmounted: when(not($connected)),
    events,

    setMounted,
  };

  return {
    ...viewModel,
    connect: connectHOC(viewModel),
    useConnect: connectHook(viewModel),
  };
};
