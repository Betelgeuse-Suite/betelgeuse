declare module Chai {
  interface Assertion {
    renderAs(expected: string[]|string): Assertion;
  }
}