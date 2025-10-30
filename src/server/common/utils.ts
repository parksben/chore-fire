import * as fs from 'node:fs'
import * as net from 'node:net'
import * as path from 'node:path'

export async function findAvailablePort(startPort: number, maxAttempts = 200): Promise<number> {
  let port = startPort

  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortAvailable(port)) {
      return port
    }
    port++
  }

  throw new Error(`Unable to find available port after ${maxAttempts} attempts`)
}

export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.listen(port, (err?: Error) => {
      if (err) {
        resolve(false)
      } else {
        server.once('close', () => {
          resolve(true)
        })
        server.close()
      }
    })

    server.on('error', () => {
      resolve(false)
    })
  })
}

export async function imageUrlToBase64(imageUrl: string): Promise<string | null> {
  try {
    // get image file path from url
    const match = imageUrl.match(/\/static\/image\/(.+)$/)
    if (!match) return null

    const fileName = match[1]
    const imagePath = path.join(__dirname, '../../ui/image', fileName)

    // check if file exists
    if (!fs.existsSync(imagePath)) {
      return null
    }

    // read file and convert to base64
    const imageBuffer = await fs.promises.readFile(imagePath)
    const base64Data = imageBuffer.toString('base64')

    return base64Data
  } catch (error) {
    console.error('Error converting image to base64:', error)
    return null
  }
}
