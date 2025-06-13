export const clone = <T>(o: T) => JSON.parse(JSON.stringify(o)) as T
