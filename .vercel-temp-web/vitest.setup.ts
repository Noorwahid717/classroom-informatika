import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - attach mock to window for components relying on ResizeObserver
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverMock;
