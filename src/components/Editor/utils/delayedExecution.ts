/**
 * Creates a delayed function that delays invoking the callback function after `ms` milliseconds.
 * The execution of the callback gets delayed only once and is not repeatedly delayed by subsequent calls.
 * This ensures that the function doesn't get called multiple times in a short period of time,
 * but ensures that the callback function is called once after one or more call after the specified `ms`.
 * If u want to use cancel make sure your calling it on the same instance of delayedExecution
 *
 * @template T The type of the callback function.
 * @param {T} callback The function to be called after the specified `ms`.
 * @param {number} ms The time in milliseconds to delay the function call.
 * @returns {T & { cancel: () => void }} Returns the new delayed function with a cancel method.
 */
export default function delayedExecution<
  T extends (...args: unknown[]) => unknown
>(callback: T, ms: number): T & { cancel: () => void } {
  let timeoutId: number | null = null;

  const delayed = (...args: Parameters<T>) => {
    if (timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        callback(...args);
        timeoutId = null;
      }, ms);
    }
  };

  delayed.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return delayed as T & { cancel: () => void };
}
