const net = require('node:net')

async function findAvailablePort(startPort, maxAttempts = 200) {
  let port = startPort

  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortAvailable(port)) {
      return port
    }
    port++
  }

  throw new Error(`Unable to find available port after ${maxAttempts} attempts`)
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.listen(port, (err) => {
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

exports.findAvailablePort = findAvailablePort
exports.isPortAvailable = isPortAvailable
module.exports = {
  findAvailablePort,
  isPortAvailable,
}
