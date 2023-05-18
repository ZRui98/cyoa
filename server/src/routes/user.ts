import { FastifyInstance, FastifyRequest } from "fastify";
import { getAdventureSummaries } from "../api/user";

const routes = (app: FastifyInstance, _opts, next) => {
    app.get('/user/:user/adventures', {
        handler: async function(req: FastifyRequest<{Params: {user: string}}>, res) {
          const { user } = req.params;
          const adventures = await getAdventureSummaries(user);
          res.send(adventures);
          res.code(200);
        }
      });

      next();
};

export default routes;