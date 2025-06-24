// Base62 encoding constants
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// Convert bytes to Base62 string
function bytesToBase62(bytes: Uint8Array): string {
  let num = 0n
  for (let i = 0; i < bytes.length; i++) {
    num = num * 256n + BigInt(bytes[i])
  }

  if (num === 0n) return '0'

  let result = ''
  while (num > 0n) {
    result = BASE62_CHARS[Number(num % 62n)] + result
    num = num / 62n
  }

  return result
}

// Convert Base62 string back to bytes
function base62ToBytes(base62: string): Uint8Array {
  let num = 0n
  for (let i = 0; i < base62.length; i++) {
    const char = base62[i]
    const digit = BigInt(BASE62_CHARS.indexOf(char))
    num = num * 62n + digit
  }

  // Convert back to bytes
  const bytes: number[] = []
  while (num > 0n) {
    bytes.unshift(Number(num % 256n))
    num = num / 256n
  }

  return new Uint8Array(bytes)
}

// Function to compress and encode to Base62
export async function compressToBase62(obj: unknown): Promise<string> {
  try {
    const jsonString: string = JSON.stringify(obj)
    const textEncoder: TextEncoder = new TextEncoder()
    const inputStream: ReadableStream<Uint8Array> = new ReadableStream({
      start(controller: ReadableStreamDefaultController<Uint8Array>) {
        controller.enqueue(textEncoder.encode(jsonString))
        controller.close()
      },
    })

    const compressionStream: CompressionStream = new CompressionStream('gzip')
    const compressedStream: ReadableStream<Uint8Array> = inputStream.pipeThrough(compressionStream)
    const compressedData: ArrayBuffer = await new Response(compressedStream).arrayBuffer()
    const bytes = new Uint8Array(compressedData)

    return bytesToBase62(bytes)
  } catch (error: unknown) {
    console.error('Compression error:', error)
    throw error
  }
}

// Function to decompress from Base62
export async function decompressFromBase62<T>(base62: string): Promise<T> {
  try {
    console.log('Decompressing from Base62:', base62)
    const compressedData: Uint8Array = base62ToBytes(base62)

    const inputStream: ReadableStream<Uint8Array> = new ReadableStream({
      start(controller: ReadableStreamDefaultController<Uint8Array>) {
        controller.enqueue(compressedData)
        controller.close()
      },
    })

    const decompressionStream: DecompressionStream = new DecompressionStream('gzip')
    const decompressedStream: ReadableStream<Uint8Array> = inputStream.pipeThrough(decompressionStream)
    const decompressedData: ArrayBuffer = await new Response(decompressedStream).arrayBuffer()
    const textDecoder: TextDecoder = new TextDecoder()
    const jsonString: string = textDecoder.decode(decompressedData)

    return JSON.parse(jsonString) as T
  } catch (error: unknown) {
    console.error('Decompression error:', error)
    throw error
  }
}
