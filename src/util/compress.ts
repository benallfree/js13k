// Function to compress and encode to Base64
export async function compressToBase64(obj: unknown): Promise<string> {
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
    const binaryString: string = new Uint8Array(compressedData).reduce(
      (data: string, byte: number) => data + String.fromCharCode(byte),
      ''
    )
    return btoa(binaryString)
  } catch (error: unknown) {
    console.error('Compression error:', error)
    throw error
  }
}

// Function to decompress from Base64
export async function decompressFromBase64<T>(base64: string): Promise<T> {
  try {
    const binaryString: string = atob(base64)
    const compressedData: Uint8Array = new Uint8Array(binaryString.length)
    for (let i: number = 0; i < binaryString.length; i++) {
      compressedData[i] = binaryString.charCodeAt(i)
    }

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
