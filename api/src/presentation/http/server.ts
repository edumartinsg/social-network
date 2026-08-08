import { env } from '@/env'
import { app } from './app'

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
