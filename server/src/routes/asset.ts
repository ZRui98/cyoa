import { FastifyInstance, FastifyRequest } from "fastify"
import { saveAsset, updateAsset } from "../api/storage/asset";
import { getAllAssetsByUser } from "../api/db/asset";
import { BusboyFileStream } from "@fastify/busboy";

const FILE_SIZE_150_MB = 150000000;
const assetUploadConfig = { limits: { fields: 5, files: 1, fileSize: FILE_SIZE_150_MB }};

const routes = (app: FastifyInstance, _opts, next) => {
    app.post('/', {
        handler: async function(req: FastifyRequest, res) {
            try {
                const data = await req.file(assetUploadConfig);

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
                console.log('err', err.message);
                res.code(500);
            }
        }
    });

    app.put('/:id', {
        handler: async function(req: FastifyRequest<{Params: {id: number}}>, res) {
            const { id } = req.params;
            let fileData: {file: BusboyFileStream, filename: string} | undefined;
            let name: string | undefined;
            const data = await req.file(assetUploadConfig);
            if (data) {
                fileData = {file: data.file, filename: data.filename};
                const fields = data.fields as unknown as {
                    name?: {
                        value?: string
                    };
                };
                name = fields.name?.value ?? data.filename;
            } else {
                const parts = req.parts(assetUploadConfig);
                for await (const part of parts) {
                    console.log('running this now', part.type);
                    const fields = part.fields as unknown as {
                        name?: {
                            value?: string
                        };
                    };
                    name = fields.name?.value
                }
            }
            if (!name && !fileData) {
                res.code(204);
                return;
            }
            const value = await updateAsset({...fileData, name, id});
            res.code(value ? 201 : 200);
        },
        schema: {params: {id: {type: 'number'}}}
    })

    app.get('/', {
        handler: async function(req: FastifyRequest, res) {
            const assets = await getAllAssetsByUser('user1');
            res.send(assets)
        }
    });

    next();
};

export default routes;