import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import passport from '@fastify/passport';
import { isLoggedIn } from '../api/auth/hooks';
import { activateUser } from '../api/db/user';

const routes = (app: FastifyInstance, _opts, next) => {
  app.post('/google/login', {
    preValidation: passport.authenticate('sign-in-with-google'),
    handler: async function (req: FastifyRequest, res: FastifyReply) {
      req.log.info('redirecting to frontend login page');
      res.redirect(`${process.env.LOGIN_REDIRECT_URL}`);
    },
  });

  app.post('/activate', {
    preHandler: isLoggedIn,
    handler: async (req: FastifyRequest<{ Body: { name: string } }>, res: FastifyReply) => {
      const newState = await activateUser(req.body, req.user!.name);
      req.session.set('passport', newState);
      res.code(200);
      res.send(newState);
    },
    //   schema: {
    //     body: {
    //         type: 'object',
    //         properties: {
    //             name: {type: 'string'}
    //         },
    //         required: ['name']
    //     }
    // }
  });

  app.post('/logout', {
    handler: async function (req: FastifyRequest, res: FastifyReply) {
      req.logOut();
      res.code(200);
    },
  });

  app.get('/status', {
    handler: async function (req, res) {
      res.code(200);
      res.send({ user: req.user?.name ?? undefined, activated: !!req.user?.activated });
    },
  });

  next();
};

export default routes;
