declare module Chai {
  interface Assertion {
    renderAs(expected: any): Assertion;
  }
}