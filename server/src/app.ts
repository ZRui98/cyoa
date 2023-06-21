import cors from '@fastify/cors'
import multipart from '@fastify/multipart';
import formbody from '@fastify/formbody';
import passport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';

import fastify from 'fastify';
import { default as adventureRoutes } from './routes/adventure';
import { default as assetRoutes } from './routes/asset';
import { default as userRoutes } from './routes/user';
import { default as authRoutes } from './routes/auth';
import { adventureMetadataSchema, adventureSchema } from './models/Adventure';
import path from 'path';
import * as fs from 'fs';
import { SignInWithGoogleStrategy } from './api/middleware/SignInWithGoogleStrategy';

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
// auth
app.register(fastifySecureSession, {
  key: Buffer.from(`${process.env.SECRET_SESSION_KEY}`, 'hex'),
  cookie: {
    path: '/',
    sameSite: 'strict',
  }
}).register(passport.initialize())
.register(passport.secureSession());

passport.use('sign-in-with-google', new SignInWithGoogleStrategy({
  clientID: `${process.env.GOOGLE_SIGN_IN_CLIENT_ID}`,
  clientSecret: `${process.env.GOOGLE_SIGN_IN_CLIENT_SECRET}`
}, async (profile, done) => {
  
  const user = {
    name: profile.name,
    email: profile.email,
    id: profile.sub
  }
  done(undefined, user);
}))

passport.registerUserSerializer(async (user, req) => {
  app.log.info({user}, "user serialization");
  return user;
});

passport.registerUserDeserializer(async (user, req) => {
  return user;
})

app.register(cors, {
  origin: `${process.env.CORS_DOMAIN}`.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
});
app.register(multipart).register(formbody);

// routes
app.register(adventureRoutes, {prefix: '/adventure'})
  .register(assetRoutes, { prefix: '/asset'})
  .register(userRoutes, { prefix: '/user'})
  .register(authRoutes, { prefix: '/auth'});

export const log = app.log;
export default app;