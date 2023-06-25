import app from "./app";
import { UserTable } from "./models/User";
declare module 'fastify' {
    interface PassportUser {
        name: string,
        activated: boolean,
    }
};
app.listen({ port: 3000, host: '0.0.0.0' });