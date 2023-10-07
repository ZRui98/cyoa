import { FastifyInstance, FastifyRequest } from "fastify"
import { deleteAsset, saveAsset, updateAsset } from "../api/storage/asset";
import { getAllAssetsByUser, getAllAssetsByUserAndNames, getManagedAssetResponse } from "../api/db/asset";
import { BusboyFileStream } from "@fastify/busboy";
import { ApiError, isApiError } from "../util/error";
import { isLoggedInAndAuthenticated } from "../api/auth/hooks";

const FILE_SIZE_150_MB = 150000000;
const assetUploadConfig = { limits: { fields: 5, files: 1, fileSize: FILE_SIZE_150_MB }};

const routes = (app: FastifyInstance, _opts, next) => {
    app.post('/', {
        preHandler: isLoggedInAndAuthenticated,
        handler: async function(req: FastifyRequest, res) {
            
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
            const response = await saveAsset({file: data.file, filename: data.filename, name}, req.user!.name);
    
            res.code(201);
            res.send(response);
        }
    });

    app.put('/:name', {
        preHandler: isLoggedInAndAuthenticated,
        handler: async function(req: FastifyRequest<{Params: {name: string}}>, res) {
            const { name } = req.params;
            let fileData: {file: BusboyFileStream, filename: string} | undefined;
            let newName: string | undefined;
            const data = await req.file(assetUploadConfig);
            app.log.info({data}, "data here");
            if (data) {
                fileData = {file: data.file, filename: data.filename};
                const fields = data.fields as unknown as {
                    name?: {
                        value?: string
                    };
                };
                newName = fields.name?.value ?? data.filename;
            }
            if (!name && !fileData) {
                res.code(204);
                return;
            }
            app.log.info({name: newName, fileData}, "uploaded file")
            const value = await updateAsset({...fileData, name}, req.user!.name);
            res.code(value ? 201 : 200);
            res.send(value);
        },
        schema: {params: {name: {type: 'string'}}}
    });


    app.delete('/:name', {
        preHandler: isLoggedInAndAuthenticated,
        handler: async function(req: FastifyRequest<{Params: {name: string}}>, res) {
            const { name } = req.params;
            const response = await deleteAsset(name, req.user!.name);
            res.code(201);
            res.send(response);
        },
        schema: {params: {name: {type: 'string'}}}
    });

    app.get('/', {
        preHandler: isLoggedInAndAuthenticated,
        handler: async function(req: FastifyRequest<{Querystring: {includePath: boolean}}>, res) {
            const author = req.user!.name;
            const { includePath } = req.query;
            const assets = await getAllAssetsByUser(author);
            const managedAssets = getManagedAssetResponse(author, assets, includePath);
            res.send(managedAssets);
        }
    });

    app.get('/assetUrl/:user', {
        handler: async function(req: FastifyRequest<{Params: {user: string}, Querystring: {assetNames: string[]}}>, res) {
            const { user } = req.params;
            const { assetNames } = req.query;
            if (!user) {
                res.code(400);
                res.send("Missing asset names in query parameter");
                return;
            }
            const assets = await getAllAssetsByUserAndNames(user, assetNames);
            const assetResponse = getManagedAssetResponse(user, assets, true)
            res.send(assetResponse);
        },
        schema: {params: {user: {type: 'string'}}, querystring: {assetNames: {type: "array"}}}
    })

    next();
};

export default routes;