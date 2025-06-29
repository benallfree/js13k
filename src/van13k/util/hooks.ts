import { service } from './service'

export const createHook = <T>(name: string) => {
  return () => service<T>(name) as T
}
