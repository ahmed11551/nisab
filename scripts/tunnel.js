// Simple localtunnel runner that writes the public URL to a file and keeps the tunnel alive
const fs = require('fs')
const path = require('path')

async function main() {
  const lt = await import('localtunnel')
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
  const tunnel = await lt.default({ port })

  const outDir = path.resolve(__dirname, '..', '.tmp')
  const outFile = path.join(outDir, 'lt-url.txt')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outFile, tunnel.url, 'utf8')
  console.log(`Localtunnel URL: ${tunnel.url}`)

  tunnel.on('close', () => {
    try {
      fs.unlinkSync(outFile)
    } catch {}
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('Tunnel error:', err)
  process.exit(1)
})


