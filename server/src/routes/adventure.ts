import { FastifyInstance, FastifyRequest } from "fastify";
import { saveAdventure } from "../api/storage";
import { Adventure } from "../models/Adventure";
import { getFileURLFromId } from "../db/adventure";

const routes = (app: FastifyInstance, _opts, next) => {

    app.get('/:user/:filename', {
        handler: async function (req: FastifyRequest<{Params: {user: string, filename: string}}>, res) { 
          const { user, filename } = req.params;
          const url = await getFileURLFromId(user, filename);
          res.code(200).send({url});
        },
        schema: {
            params: {
                type: 'object',
                properties: {
                    user: {type: 'string'},
                    filename: {type: 'string'}
                },
                required: ['user', 'filename']
            }
        }
      });
      
      app.put('/:id', {
        handler: async function (req: FastifyRequest<{Params: {id: string}}>, res) {
          const { id } = req.params;
        },
        // schema: {
        //   body: {$ref: 'adventure#'},
        //   params: {id: {type: 'number'}}
        // }
      });
      
      app.post('/', {
        handler: async function (req: FastifyRequest<{ Body: Adventure}>, res) { 
          const user = 'user1';
          const adventure = req.body;
          adventure.author = user;
          await saveAdventure(user, adventure)
          res.code(201);
        },
        schema: {
          body: {$ref: 'adventure#'}
        }
      });

      next();
}

export default routes;