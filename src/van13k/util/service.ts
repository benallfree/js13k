const services = new Map<string, any>()
export const service = <TService>(name: string, setter?: TService): TService => {
  if (setter) {
    services.set(name, setter)
  }

  const service = services.get(name)

  if (!service) {
    throw new Error(`Service ${name} not found`)
  }

  return service
}
