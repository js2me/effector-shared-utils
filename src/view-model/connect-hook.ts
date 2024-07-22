import { useLayoutEffect } from 'react';

import { ViewModelInternal } from './types';

export const connectHook = <Events extends AnyObject>(
  vm: ViewModelInternal<Events>,
) => {
  return () => {
    useLayoutEffect(() => {
      vm.setMounted(true);
      return () => {
        vm.setMounted(false);
      };
    }, []);
  };
};
