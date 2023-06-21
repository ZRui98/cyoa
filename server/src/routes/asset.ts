import { FastifyInstance, FastifyRequest } from "fastify"
import { deleteAsset, saveAsset, updateAsset } from "../api/storage/asset";
import { getAllAssetsByUser } from "../api/db/asset";
import { BusboyFileStream } from "@fastify/busboy";
import { ApiError, isApiError } from "../util/error";

const FILE_SIZE_150_MB = 150000000;
const assetUploadConfig = { limits: { fields: 5, files: 1, fileSize: FILE_SIZE_150_MB }};

const routes = (app: FastifyInstance, _opts, next) => {
    app.post('/', {
        handler: async function(req: FastifyRequest, res) {
            try {
                const data = await req.file(assetUploadConfig);

                if (!data) throw Error("no file uploaded!");
                data.file.on('limit', () => {
                    throw new ApiError(400, 'file too large! Exceeded file limit of 150MB.')
                });
                const fields = data.fields as unknown as {
                    name?: {
                        value?: string
                    };
                };
                const name = (!!fields.name?.value) ? fields.name?.value : data.filename;
                const response = await saveAsset({file: data.file, filename: data.filename, name});
    
                res.code(201);
                res.send(response);
            } catch (err) {
                if (isApiError(err)) {
                    app.log.info(err, 'api error');
                    res.code(err.code);
                    res.send({message: err.message});
                    return;
                }
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
            app.log.info({data}, "data here");
            if (data) {
                fileData = {file: data.file, filename: data.filename};
                const fields = data.fields as unknown as {
                    name?: {
                        value?: string
                    };
                };
                name = fields.name?.value ?? data.filename;
            }
            if (!name && !fileData) {
                res.code(204);
                return;
            }
            app.log.info({name, id, fileData}, "uploaded file")
            const value = await updateAsset({...fileData, name, id});
            res.code(value ? 201 : 200);
            res.send(value);
        },
        schema: {params: {id: {type: 'number'}}}
    });


    app.delete('/:id', {
        handler: async function(req: FastifyRequest<{Params: {id: number}}>, res) {
            const { id } = req.params;
            const response = await deleteAsset(id);
            res.code(201);
            res.send(response);
            console.log(response);
        },
        schema: {params: {id: {type: 'number'}}}
    });

    app.get('/', {
        handler: async function(req: FastifyRequest, res) {
            const assets = await getAllAssetsByUser('user1');
            res.send(assets)
        }
    });

    next();
};

export default routes;