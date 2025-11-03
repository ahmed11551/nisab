async function main() {
  const lt = await import('localtunnel')
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
  const tunnel = await lt.default({ port })
  console.log(tunnel.url)
  await tunnel.close()
}

main().catch((e) => { console.error(e); process.exit(1) })


