import cors from '@fastify/cors'
import multipart from '@fastify/multipart';
import fastify from 'fastify';
import { default as adventureRoutes } from './routes/adventure';
import { default as assetRoutes } from './routes/asset';
import { default as userRoutes } from './routes/user';
import { adventureMetadataSchema, adventureSchema } from './models/Adventure';

const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: false
    }
  }
});

app
  .addSchema(adventureSchema)
  .addSchema(adventureMetadataSchema);


// plugins
app.register(cors, {
  origin: `${process.env.CORS_DOMAIN}`.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
})
  .register(multipart);

// routes
app.register(adventureRoutes, {prefix: '/adventure'})
  .register(assetRoutes, { prefix: '/asset'})
  .register(userRoutes, { prefix: '/user'});

export default app;