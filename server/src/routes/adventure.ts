import { FastifyInstance, FastifyRequest } from 'fastify';
import { deleteAdventure, saveAdventure, updateAdventure } from '../api/storage/adventure';
import { Adventure, AdventureMetaData } from '../models/Adventure';
import { getPresignedAdventureFromId } from '../api/db/adventure';
import { isLoggedInAndAuthenticated } from '../api/auth/hooks';
import { getAdventureSummaries } from '../api/db/user';

const routes = (app: FastifyInstance, _opts, next) => {
  app.get('/:user/:adventurename', {
    handler: async function (req: FastifyRequest<{ Params: { user: string; adventurename: string } }>, res) {
      const { user, adventurename } = req.params;
      try {
        const url = await getPresignedAdventureFromId(user, adventurename);
        res.code(200).send({ url });
      } catch (e) {
        console.log(e);
        res.code(500);
      }
    },
    schema: {
      params: {
        type: 'object',
        properties: {
          user: { type: 'string' },
          adventurename: { type: 'string' },
        },
        required: ['user', 'adventurename'],
      },
    },
  });

  app.get('/:user', {
    handler: async function (req: FastifyRequest<{ Params: { user: string } }>, res) {
      const { user } = req.params;
      const adventures = await getAdventureSummaries(user);
      res.send(adventures);
      res.code(200);
    },
    schema: {
      params: {
        type: 'object',
        properties: {
          user: { type: 'string' },
        },
        required: ['user'],
      },
    },
  });

  app.put('/:name', {
    preHandler: isLoggedInAndAuthenticated,
    handler: async function (
      req: FastifyRequest<{ Params: { name: string }; Body: Adventure | AdventureMetaData }>,
      res
    ) {
      const user = req.user!.name;
      const { name } = req.params;
      const v = req.body;
      await updateAdventure(user, v, name);
      res.code(201);
    },
    schema: {
      body: {
        type: 'object',
        oneOf: [
          {
            $ref: 'adventure',
          },
          {
            $ref: 'adventure_metadata',
          },
        ],
      },
      params: { name: { type: 'string' } },
    },
  });

  app.post('/', {
    preHandler: isLoggedInAndAuthenticated,
    handler: async function (req: FastifyRequest<{ Body: Adventure }>, res) {
      const user = req.user!.name;
      const adventure = req.body;
      adventure.author = user;
      await saveAdventure(user, adventure);
      res.code(201);
    },
    schema: {
      body: { $ref: 'adventure#' },
    },
  });

  app.delete('/:name', {
    preHandler: isLoggedInAndAuthenticated,
    handler: async function (req: FastifyRequest<{ Params: { name: string } }>, res) {
      const user = req.user!.name;
      const name = req.params.name;
      await deleteAdventure(user, name);
      res.code(201);
    },
    schema: {
      params: { name: { type: 'string' } },
    },
  });

  next();
};

export default routes;
