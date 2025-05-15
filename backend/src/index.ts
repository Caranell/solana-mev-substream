import { Prisma, PrismaClient } from '@prisma/client'
import fastify from 'fastify'
import 'dotenv/config'
import mevBundlesController from './controllers/index'

const app = fastify({ logger: true })

app.get('/statistics', mevBundlesController.getStatistics)

app.get('/bundles', mevBundlesController.getBundles)

app.listen({ port: Number(process.env.PORT) }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})
