import Sqids from "sqids";

const sqids = new Sqids({
    alphabet: process.env.SQID_SECRET_ALPHABET,
    minLength: 5,
});

export function generateSqid(data: number): string {
    return sqids.encode([data]);
}

export function decodeSqid(sqid: string): number {
    return sqids.decode(sqid)[0];
}