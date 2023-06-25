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
import { SignInWithGoogleStrategy, verify as verifyGoogle } from './api/auth/SignInWithGoogleStrategy';
import { deserializeUser, serializeUser } from './api/auth/serializers';
import { errorHandler } from './util/error';

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
    httpOnly: true
  }
}).register(passport.initialize())
.register(passport.secureSession());

passport.use('sign-in-with-google', new SignInWithGoogleStrategy({
  clientID: `${process.env.GOOGLE_SIGN_IN_CLIENT_ID}`,
  clientSecret: `${process.env.GOOGLE_SIGN_IN_CLIENT_SECRET}`
}, verifyGoogle))

passport.registerUserSerializer(serializeUser);

passport.registerUserDeserializer(deserializeUser);

app.register(cors, {
  origin: `${process.env.CORS_DOMAIN}`.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true
});
app.register(multipart).register(formbody);
app.setErrorHandler(errorHandler);

// routes
app.register(adventureRoutes, {prefix: '/adventure'})
  .register(assetRoutes, { prefix: '/asset'})
  .register(userRoutes, { prefix: '/user'})
  .register(authRoutes, { prefix: '/auth'});

export const log = app.log;
export default app;