export function debounce(fn, delay) {
  let timestamp;
  return function (...args) {
    if (timestamp) {
      clearTimeout(timestamp);
    }
    timestamp = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
