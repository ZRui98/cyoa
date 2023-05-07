import fastify, { FastifyRequest } from 'fastify';
import { Adventure, adventureSchema } from './models/Adventure';
import { getFilePathFromId, saveAdventure } from './api/storage';
import { getAdventureSummaries } from './api/user';

const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: false
    }
  }
});

app
  .addSchema(adventureSchema);

app.get('/adventure/:user/:filename', {
  handler: async function (req: FastifyRequest<{Params: {user: string, filename: string}}>, res) { 
    const { user, filename } = req.params;
    const url = await getFilePathFromId(user, filename);
    res.code(200).send({url});
  },
  schema: {
    params: {user: {type: 'string'}, filename: {type: 'string'}}
  }
});

app.put('/adventure/:user', {
  handler: async function (req: FastifyRequest<{Params: {id: number}}>, res) {
    const { id } = req.params;
  },
  // schema: {
  //   body: {$ref: 'adventure#'},
  //   params: {id: {type: 'number'}}
  // }
});

app.post('/adventure/:user/', {
  handler: async function (req: FastifyRequest<{Params: {user: string}, Body: Adventure}>, res) { 
    const { user } = req.params;
    const adventure = req.body;
    await saveAdventure(user, adventure)
    res.code(201);
  },
  schema: {
    params: {user: {type: 'string'}},
    body: {$ref: 'adventure#'}
  }
});

app.get('/user/:user/adventures', {
  handler: async function(req: FastifyRequest<{Params: {user: string}}>, res) {
    const { user } = req.params;
    const adventures = await getAdventureSummaries(user);
    res.send(adventureSchema);
    res.code(200);
  }
})

export default app;