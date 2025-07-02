// Generate a shorter but still highly unique ID (used for JS13K size constraints)
// Uses safe characters to avoid visual confusion (no O/0, I/l/1, etc.)

export const generateGuid = (length: number = 8) => {
  // Safe characters: excludes 0,1,I,L,O for readability
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
