import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getAdventureSummaries } from "../api/db/user";
import passport from '@fastify/passport';

const routes = (app: FastifyInstance, _opts, next) => {
    app.get('/auth/google/signup', {
        handler: async function(req: FastifyRequest<{Params: {user: string}}>, res) {
          const { user } = req.params;
          const adventures = await getAdventureSummaries(user);
          res.send(adventures);
          res.code(200);
        }
      });
    
    app.post('/google/callback', {
        preValidation: passport.authenticate('sign-in-with-google', {scope: ["email"]}),
        handler: async function(_req: FastifyRequest, res: FastifyReply) {
          res.redirect(`${process.env.LOGIN_REDIRECT_URL}`)
        }
    })

      next();
};

export default routes;