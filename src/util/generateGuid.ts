// Generate a shorter but still highly unique ID (used for JS13K size constraints)

export const generateGuid = () => {
  // Generate 8 random bytes and convert to base64
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-') // URL-safe
    .replace(/\//g, '_')
    .replace(/=+$/, '') // Remove padding
}
