import { FastifyInstance, FastifyRequest } from 'fastify';
import { getUserFromDb, updateUserDb } from '../api/db/user';
import { getUserProfileData } from '../models/User';
import { isLoggedInAndAuthenticated } from '../api/auth/hooks';

const routes = (app: FastifyInstance, _opts, next) => {
  app.get('/:user', {
    handler: async function (req: FastifyRequest<{ Params: { user: string } }>, res) {
      const name = req.params.user;
      const user = await getUserFromDb({ name });
      if (!user) {
        res.code(404);
        return;
      }

      res.code(200).send(getUserProfileData(user));
    },
    schema: { params: { user: { type: 'string' } } },
  });

  app.put('/:user', {
    preHandler: isLoggedInAndAuthenticated,
    handler: async function (req: FastifyRequest<{ Params: { user: string }; Body: { bio?: string } }>, res) {
      const name = req.params.user;
      const user = await getUserFromDb({ name });
      if (!user) {
        res.code(404);
        return;
      }
      const body = req.body;
      user.bio = body.bio ?? user.bio;
      const newUser = await updateUserDb({ bio: user.bio }, name);
      res.code(201).send(getUserProfileData(newUser));
    },
    schema: { params: { user: { type: 'string' } }, body: { bio: { type: 'string', nullable: true } } },
  });
  next();
};

export default routes;
