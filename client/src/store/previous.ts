import { get, writable } from 'svelte/store';

export const previousWritable = <T>(initialValue: T) => {
  const latestVal = writable<T>(initialValue);
  const prevVal = writable<T | undefined>(undefined);
  function setValue(newVal: T) {
    prevVal.set(JSON.parse(JSON.stringify(get(latestVal))));
    latestVal.set(newVal);
  }

  return {
    subscribe: latestVal.subscribe,
    set: setValue,
    prev: {
      subscribe: prevVal.subscribe,
    },
  };
};
