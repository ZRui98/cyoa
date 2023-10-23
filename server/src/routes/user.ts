import { FastifyInstance, FastifyRequest } from 'fastify';
import { getAdventureSummaries, getUserFromDb } from '../api/db/user';

const routes = (app: FastifyInstance, _opts, next) => {
  app.get('/:user', {
    handler: async function (req: FastifyRequest<{ Params: { user: string } }>, res) {
      const name = req.params.user;
      const user = await getUserFromDb({ name });
      if (!user) {
        res.code(404);
        return;
      }
      res.code(200);
      res.send({ name: user?.name });
    },
    schema: { params: { user: { type: 'string' } } },
  });
  next();
};

export default routes;
