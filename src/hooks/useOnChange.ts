import { useState } from 'react';

/**
 * Runs `onChange` during render when `value` changes (React's recommended
 * alternative to resetting state in an effect). Safe to call setters inside.
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useOnChange<T>(value: T, onChange: (value: T) => void) {
  const [prev, setPrev] = useState(value);
  if (!Object.is(prev, value)) {
    setPrev(value);
    onChange(value);
  }
}
