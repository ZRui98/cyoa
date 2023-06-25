import { FastifyReply, FastifyRequest } from "fastify";

export class ApiError extends Error {
    public code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    } 
}

export function errorHandler(error: Error, _req: FastifyRequest, res: FastifyReply) {
    if (isApiError(error)) {
        res.code(error.code);
        res.send({message: error.message});
        return;
    }
    res.code(500);
    res.log.error(error, "Unexpected error");
}

export function isApiError(e: Error): e is ApiError {
    const test = (e as ApiError);
    return test.code >= 0 && test.message !== undefined;
}