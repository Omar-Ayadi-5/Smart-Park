let pending = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn(pending));
}

export function subscribeApiLoading(listener) {
  listeners.add(listener);
  listener(pending);
  return () => listeners.delete(listener);
}

export function beginApiLoading() {
  pending += 1;
  emit();
}

export function endApiLoading() {
  pending = Math.max(0, pending - 1);
  emit();
}

let mutex = Promise.resolve();

/**
 * Serialize API calls: the next request waits until the previous completes.
 * @returns {() => void} Call after the HTTP cycle finishes (success or error).
 */
export async function acquireApiMutex() {
  let release;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  const prev = mutex;
  mutex = prev.then(() => next);
  await prev;
  return release;
}
