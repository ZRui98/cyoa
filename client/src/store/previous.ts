import { get, writable } from 'svelte/store';

export const previousWritable = <T>(initialValue: T) => {
  const latestVal = writable<T>(initialValue);
  latestVal.subscribe(() => console.log('changed to latestVal'));
  const prevVal = writable<T | undefined>(undefined);
  function setValue(newVal: T) {
    console.log('set', newVal, get(latestVal), get(prevVal));
    prevVal.set(JSON.parse(JSON.stringify(get(latestVal))));
    latestVal.set(newVal);
    console.log('setdone', newVal, get(latestVal), get(prevVal));
  }

  return {
    subscribe: latestVal.subscribe,
    set: setValue,
    prev: {
      subscribe: prevVal.subscribe,
    },
  };
};
