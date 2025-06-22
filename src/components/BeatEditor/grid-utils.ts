// Grid encoding/decoding functions
export const encodeGrid = (gridData: number[][]) => {
  return gridData.flat().join('')
}

export const decodeGrid = (encoded: string) => {
  if (encoded.length !== 256) return null
  const result: number[][] = []
  for (let i = 0; i < 16; i++) {
    result.push(
      encoded
        .slice(i * 16, (i + 1) * 16)
        .split('')
        .map(Number)
    )
  }
  return result
}
