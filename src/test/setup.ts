import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// jsdom has no layout. The virtualized tree reads clientHeight and clientWidth of its
// scroll container, so give every element a fixed size: 600 px fits about 16 rows.
Object.defineProperties(HTMLElement.prototype, {
  clientHeight: { configurable: true, get: () => 600 },
  clientWidth: { configurable: true, get: () => 800 },
});

// jsdom does not implement scrolling the window.
window.scrollTo = () => {};
