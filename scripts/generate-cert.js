#!/usr/bin/env node

const { existsSync, writeFileSync } = require('node:fs')
const { execSync } = require('node:child_process')
const { resolve } = require('node:path')
const { platform } = require('node:os')

const certDir = resolve(__dirname, '..')
const keyPath = resolve(certDir, 'localhost-key.pem')
const certPath = resolve(certDir, 'localhost-cert.pem')

// Check if certificates already exist
if (existsSync(keyPath) && existsSync(certPath)) {
  console.log('✅ SSL certificates already exist, skipping generation')
  process.exit(0)
}

console.log('🔐 Starting SSL certificate generation...')

/**
 * Detect and install mkcert
 */
function ensureMkcert() {
  try {
    execSync('which mkcert', { stdio: 'pipe' })
    return true
  } catch (e) {
    console.log('📦 mkcert not installed, attempting automatic installation...')
    
    const os = platform()
    
    try {
      if (os === 'darwin') {
        // macOS - use Homebrew
        console.log('   Detected macOS, installing mkcert using Homebrew...')
        
        // Check if Homebrew is installed
        try {
          execSync('which brew', { stdio: 'pipe' })
        } catch (e) {
          console.warn('⚠️  Homebrew not detected, cannot auto-install mkcert')
          console.warn('   Please install Homebrew first: https://brew.sh')
          return false
        }
        
        // Use arch command to ensure running under correct architecture
        const brewCmd = process.arch === 'arm64' 
          ? 'arch -arm64 brew install mkcert' 
          : 'brew install mkcert'
        
        execSync(brewCmd, { stdio: 'inherit' })
        console.log('✅ mkcert installed successfully')
        return true
        
      } else if (os === 'linux') {
        // Linux - try using package manager
        console.log('   Detected Linux, attempting to install mkcert...')
        
        // Try different package managers
        const packageManagers = [
          { cmd: 'apt-get', install: 'sudo apt-get update && sudo apt-get install -y mkcert' },
          { cmd: 'yum', install: 'sudo yum install -y mkcert' },
          { cmd: 'pacman', install: 'sudo pacman -S mkcert' },
        ]
        
        for (const pm of packageManagers) {
          try {
            execSync(`which ${pm.cmd}`, { stdio: 'pipe' })
            execSync(pm.install, { stdio: 'inherit' })
            console.log('✅ mkcert installed successfully')
            return true
          } catch (e) {
            continue
          }
        }
        
        console.warn('⚠️  Cannot auto-install mkcert')
        console.warn('   Please install manually: https://github.com/FiloSottile/mkcert')
        return false
        
      } else if (os === 'win32') {
        // Windows - use Chocolatey
        console.log('   Detected Windows, attempting to install mkcert using Chocolatey...')
        
        try {
          execSync('choco --version', { stdio: 'pipe' })
          execSync('choco install mkcert -y', { stdio: 'inherit' })
          console.log('✅ mkcert installed successfully')
          return true
        } catch (e) {
          console.warn('⚠️  Chocolatey not detected, cannot auto-install mkcert')
          console.warn('   Please install Chocolatey first: https://chocolatey.org')
          console.warn('   Or install mkcert manually: https://github.com/FiloSottile/mkcert')
          return false
        }
      }
      
      return false
    } catch (error) {
      console.error('❌ Failed to install mkcert:', error.message)
      return false
    }
  }
}

/**
 * Generate certificate using mkcert
 */
function generateWithMkcert() {
  try {
    console.log('📦 Generating certificate using mkcert...')
    
    // Ensure mkcert root certificate is installed
    try {
      execSync('mkcert -install', { stdio: 'inherit' })
    } catch (e) {
      console.warn('⚠️  Cannot install root certificate, may need to trust certificate manually')
    }
    
    // Generate certificate
    execSync(`mkcert -key-file ${keyPath} -cert-file ${certPath} localhost 127.0.0.1 ::1`, {
      stdio: 'inherit',
      cwd: certDir,
    })
    
    console.log('✅ SSL certificate generated successfully (using mkcert)')
    console.log(`   - Private key: ${keyPath}`)
    console.log(`   - Certificate: ${certPath}`)
    console.log('')
    console.log('🎉 Certificate is trusted, browser will not show security warnings')
    return true
  } catch (error) {
    console.error('❌ Failed to generate certificate with mkcert:', error.message)
    return false
  }
}

/**
 * Generate self-signed certificate using openssl
 */
function generateWithOpenssl() {
  try {
    console.log('📦 Generating self-signed certificate using openssl...')
    
    execSync('which openssl', { stdio: 'pipe' })
    
    const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = Development
CN = localhost

[v3_req]
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
basicConstraints = CA:FALSE

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`
    
    const configPath = resolve(certDir, '.openssl-config.tmp')
    writeFileSync(configPath, opensslConfig)
    
    // Generate private key and certificate
    execSync(
      `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -config ${configPath}`,
      { stdio: 'inherit', cwd: certDir }
    )
    
    // Clean up temporary config file
    try {
      const { unlinkSync } = require('node:fs')
      unlinkSync(configPath)
    } catch (e) {
      // Ignore cleanup errors
    }
    
    console.log('✅ SSL certificate generated successfully (using openssl)')
    console.log(`   - Private key: ${keyPath}`)
    console.log(`   - Certificate: ${certPath}`)
    console.log('')
    console.log('⚠️  Note: This is a self-signed certificate, browser will show security warnings')
    console.log('   On first visit, click "Advanced" → "Proceed to site"')
    return true
  } catch (error) {
    console.error('❌ openssl not installed or execution failed:', error.message)
    return false
  }
}

// Main process
try {
  // 1. Try using mkcert first (preferred, if already installed or can be successfully installed)
  if (ensureMkcert()) {
    if (generateWithMkcert()) {
      process.exit(0)
    }
  }
  
  // 2. If mkcert is not available, fallback to openssl
  console.log('⬇️  Falling back to openssl...')
  if (generateWithOpenssl()) {
    process.exit(0)
  }
  
  // 3. Both methods failed
  throw new Error('Failed to generate SSL certificate')
  
} catch (error) {
  console.error('')
  console.error('❌ Failed to generate SSL certificate:', error.message)
  console.error('')
  console.error('Please install one of the following tools:')
  console.error('  - mkcert (recommended): https://github.com/FiloSottile/mkcert')
  console.error('  - openssl: Usually pre-installed on most systems')
  console.error('')
  console.error('Or manually generate the certificate and try again')
  process.exit(1)
}
