import { FastifyInstance, FastifyRequest } from "fastify"
import { saveAsset } from "../api/storage";

const FILE_SIZE_150_MB = 150000000;

const routes = (app: FastifyInstance, _opts, next) => {
    app.post('/', {
        handler: async function(req: FastifyRequest, res) {
            try {
                // const parts = req.parts();
                // for await (const part of parts) {

                // }
                const data = await req.file({ limits: { fileSize: FILE_SIZE_150_MB }});

                if (!data) throw Error("no file uploaded!");
                data.file.on('limit', () => {
                    throw Error('file too large! Exceeded file limit of 150MB.')
                });
                const fields = data.fields as unknown as {
                    name?: {
                        value?: string
                    };
                };
                const name = fields.name?.value ?? data.filename;
                await saveAsset({file: data.file, filename: data.filename, name});
    
                res.code(201);
            } catch (err) {
                if (err === 'file too large! Exceeded file limit of 150MB.') {
                    res.code(400);
                }
                console.log(err);
                res.code(500);
            }
        }
    });

    next();
};

export default routes;