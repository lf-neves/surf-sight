import originalPMap from 'p-map';

import { getMaxConcurrency } from './getMaxConcurrency';

export const pMap = <Element, NewElement>(
  input: Iterable<Element>,
  mapper: originalPMap.Mapper<Element, NewElement>,
  options?: originalPMap.Options
): Promise<NewElement[]> => {
  return originalPMap<Element, NewElement>(input, mapper, {
    // calls originalPMap, with default concurrency set to getMaxConcurrency
    concurrency: getMaxConcurrency(),
    ...options,
  });
};

export const unsafePromiseAll = Promise.all.bind(Promise);
