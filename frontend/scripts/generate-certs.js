const mkcert = require('mkcert')
const fs = require('fs')
const path = require('path')

async function generateCertificates() {
  const certsDir = path.join(__dirname, '..', 'certificates')
  
  // Create certificates directory if it doesn't exist
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true })
  }

  console.log('Generating SSL certificates...')

  // Create a certificate authority
  const ca = await mkcert.createCA({
    organization: 'FocusFlow AI Dev',
    countryCode: 'US',
    state: 'California',
    locality: 'San Francisco',
    validity: 365
  })

  // Create a certificate
  const cert = await mkcert.createCert({
    domains: ['localhost', '127.0.0.1', '192.168.4.56'],
    validity: 365,
    ca: {
      key: ca.key,
      cert: ca.cert
    }
  })

  // Save the certificates
  fs.writeFileSync(path.join(certsDir, 'localhost-key.pem'), cert.key)
  fs.writeFileSync(path.join(certsDir, 'localhost.pem'), cert.cert)
  fs.writeFileSync(path.join(certsDir, 'ca.pem'), ca.cert)

  console.log('✓ Certificates generated successfully!')
  console.log('✓ Location:', certsDir)
  console.log('\nTo trust the certificate on your mobile device:')
  console.log('1. Transfer ca.pem to your mobile device')
  console.log('2. Install it as a trusted certificate')
  console.log('   - iOS: Settings > General > VPN & Device Management')
  console.log('   - Android: Settings > Security > Install from storage')
}

generateCertificates().catch(console.error)
