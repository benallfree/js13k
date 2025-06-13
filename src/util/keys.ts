import { Nil, StringifiedKey } from './interfaces'

export function keys<T>(object: Nil | T): Array<StringifiedKey<T>> {
  let val = keysOfNonArray(object)
  if (Array.isArray(object)) {
    val = val.filter((item) => item !== 'length')
  }
  return val as any
}

export function keysOfNonArray<T>(object: Nil | T): Array<StringifiedKey<T>> {
  return object ? (Object.getOwnPropertyNames(object) as any) : []
}
