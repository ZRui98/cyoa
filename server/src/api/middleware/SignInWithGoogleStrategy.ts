import { Strategy } from "@fastify/passport";
import { FastifyRequest } from "fastify";
import { OAuth2Client } from "google-auth-library";

export interface SignInWithGoogleStrategyOptions {
    clientID: string;
    clientSecret: string;
}

type VerifyFunction = (profile: any, done: (error: Error | undefined, user: any, info?: any) => void) => Promise<void>;

export class SignInWithGoogleStrategy extends Strategy {
    private client: OAuth2Client;
    private options: SignInWithGoogleStrategyOptions;
    private verify: VerifyFunction;
    constructor(options: SignInWithGoogleStrategyOptions, verifyFunction: VerifyFunction) {
        super('sign-in-with-google');
        this.client = new OAuth2Client(options.clientID, options.clientSecret);
        this.options = options;
        this.verify = verifyFunction;
    }

    public done(error: Error | undefined, user: any, info?: any) {
        if (error) {
            this.error(error);
            return;
        }

        if (!user) {
            this.fail();
            return;
        }
        this.success(user, info);
    }

    public async authenticate(request: FastifyRequest<{Body: {clientId: string, credential: string}}>, options?: any): Promise<void> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: request.body.credential,
                audience: this.options.clientID,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            await this.verify(payload, this.done.bind(this));
        } catch(e) {
            request.log.error("Failed to log in user");
            this.error(e);
        }
    }
}