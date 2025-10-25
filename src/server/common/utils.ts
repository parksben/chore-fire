import * as net from 'node:net'

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
