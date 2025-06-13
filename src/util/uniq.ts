import { ValueIteratee } from './interfaces'

export function uniqBy<T>(array: T[], iteratee: ValueIteratee<T, any>): T[] {
  const seen = new Set<T>()
  return array.filter((element) => {
    const key = iteratee(element)
    const isNew = !seen.has(key)
    seen.add(key)
    return isNew
  })
}

export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}
