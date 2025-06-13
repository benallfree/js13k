export function flatten<T>(arr: T[][]): T[] {
  return arr.reduce((result, currentArray) => result.concat(currentArray), [])
}
