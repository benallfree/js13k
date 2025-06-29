const services = new Map<string, any>()
export const service = <TService>(name: string, setter?: TService): TService => {
  if (setter) {
    services.set(name, setter)
  }
  const svc = services.get(name)
  if (!svc) {
    throw new Error(`Service ${name} not found`)
  }
  return svc
}
