export class ApiError extends Error {
    public code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    } 
}

export function isApiError(e: Error): e is ApiError {
    const test = (e as ApiError);
    return test.code >= 0 && test.message !== undefined;
}