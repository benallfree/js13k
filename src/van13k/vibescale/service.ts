const services = new Map<string, any>()
export const service = <TService>(name: string, setter?: TService): TService => {
  if (setter) {
    services.set(name, setter)
  }

  return services.get(name) as TService
}
