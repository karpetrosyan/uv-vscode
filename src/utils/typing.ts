export function assertNever(x: never): never {
  throw new Error(`Unhandled state type: ${(x as any).type}`); // eslint-disable-line @typescript-eslint/no-explicit-any
}
