import app from './app';

declare module 'fastify' {
  interface PassportUser {
    name: string;
    activated: boolean;
  }
}

declare module '@fastify/secure-session' {
  interface SessionData {
    passport: { name: string; activated: boolean };
  }
}

app.listen({ port: 3000, host: '0.0.0.0' });

