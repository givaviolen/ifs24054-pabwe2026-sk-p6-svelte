import { get, writable } from "svelte/store";

/**
 * Hook input formulir berbasis Svelte store.
 * Pemakaian: const { value: email } = useInput("");  lalu  bind:value={$email}
 */
export function useInput(initialValue) {
  const value = writable(initialValue);

  return {
    value,
    getValue: () => get(value),
    reset: () => value.set(initialValue),
  };
}
