export async function compress(s: string) {
  const byteArray = new TextEncoder().encode(s)
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(byteArray)
  writer.close()
  const compressed = await new Response(cs.readable).arrayBuffer()
  const compressedArray = new Uint8Array(compressed)
  const compressedString = String.fromCharCode.apply(null, compressedArray)

  return encodeURIComponent(btoa(compressedString))
}

export function decompress(s: string) {
  const compressedString = atob(decodeURIComponent(s))
  const compressedArray = new Uint8Array(compressedString.length)

  for (let i = 0; i < compressedString.length; i++) {
    compressedArray[i] = compressedString.charCodeAt(i)
  }

  const cs = new DecompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(compressedArray)
  writer.close()
  return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
    return new TextDecoder().decode(arrayBuffer)
  })
}
