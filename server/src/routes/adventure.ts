import { FastifyInstance, FastifyRequest } from "fastify";
import { saveAdventure, updateAdventure } from "../api/storage/adventure";
import { Adventure, AdventureMetaData } from "../models/Adventure";
import { getFileURLFromId } from "../api/db/adventure";
import { isLoggedInAndAuthenticated } from "../api/auth/hooks";
import { getAdventureSummaries } from "../api/db/user";

const routes = (app: FastifyInstance, _opts, next) => {

    app.get('/:user/:adventurename', {
        handler: async function (req: FastifyRequest<{Params: {user: string, adventurename: string}}>, res) { 
          const { user, adventurename } = req.params;
          const url = await getFileURLFromId(user, adventurename);
          res.code(200).send({url});
        },
        schema: {
            params: {
                type: 'object',
                properties: {
                    user: {type: 'string'},
                    adventurename: {type: 'string'}
                },
                required: ['user', 'adventurename']
            }
        }
      });
      
      app.put('/:id', {
        preHandler: isLoggedInAndAuthenticated,
        handler: async function (req: FastifyRequest<{Params: {id: number}, Body: Adventure | AdventureMetaData}>, res) {
          const user = req.user!.name;
          const { id } = req.params;
          const v = req.body;
          await updateAdventure(user, v, id);
          res.code(201);
        },
        schema: {
          body: {
            type: "object",
            oneOf: [
              {
                $ref: 'adventure'
              },
              {
                $ref: 'adventure_metadata'
              }
            ]
          },
          params: {id: {type: 'number'}}
        }
      });
      
      app.post('/', {
        preHandler: isLoggedInAndAuthenticated,
        handler: async function (req: FastifyRequest<{ Body: Adventure}>, res) {
          const user = req.user!.name;
          const adventure = req.body;
          adventure.author = user;
          await saveAdventure(user, adventure)
          res.code(201);
        },
        schema: {
          body: {$ref: 'adventure#'}
        }
      });

      app.get('/:user', {
        handler: async function(req: FastifyRequest<{Params: {user: string}}>, res) {
          const { user } = req.params;
          const adventures = await getAdventureSummaries(user);
          res.send(adventures);
          res.code(200);
        }
      });

      next();
}

export default routes;