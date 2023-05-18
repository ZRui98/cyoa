import multipart from '@fastify/multipart';
import fastify from 'fastify';
import { adventureSchema } from './models/Adventure';
import { default as adventureRoutes } from './routes/adventure';
import { default as assetRoutes } from './routes/asset';
import { default as userRoutes } from './routes/user';

const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: false
    }
  }
});

app
  .addSchema(adventureSchema);
app.register(multipart);


app.register(adventureRoutes, {prefix: '/adventure'});
app.register(assetRoutes, { prefix: '/asset'});
app.register(userRoutes, { prefix: '/user'});

export default app;