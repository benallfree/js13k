/**
 * Split a string into chunks of specified size
 * @param str - String to split
 * @param chunkSize - Size of each chunk
 * @returns Array of chunks
 */

export const chunkString = (str: string, chunkSize: number = 100): string[] => {
  const chunks: string[] = []
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize))
  }
  return chunks
}
/**
 * Join chunks back into a single string
 * @param chunks - Array of chunks to join
 * @returns Joined string
 */

export const joinChunks = (chunks: string[]): string => {
  return chunks.join('')
}
