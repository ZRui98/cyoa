import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import stream from "stream";

export const s3 = new S3({
    region: "us-east-1",
    endpoint: `${process.env.STORAGE_URL}`,
    credentials: {
      accessKeyId: `${process.env.ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
    },
    forcePathStyle: true
});

export async function getPresignedUrlForFiles(user: string, files: string[]): Promise<{[key: string]: string}> {
    const urls = {};
    await Promise.all(files.map(async (file) => {
        if (urls[file]) return;
        const command = new GetObjectCommand({
            
            Bucket: user, 
            Key: file
        });
        const url = await getSignedUrl(s3, command, {expiresIn: 900 * 60});
        urls[file] = url;
    }));
    return urls;
}

export function uploadFromStream(filePath: string, user: string, mimeType: string = 'application/json'): {pass: stream.PassThrough, upload: Upload} {
    let pass = new stream.PassThrough();
    let params = {Bucket: user, Key: filePath, Body: pass, ContentType: mimeType, ContentDisposition: 'inline'};
    const upload = new Upload({
        client: s3,
        leavePartsOnError: true, // optional manually handle dropped parts
        params,
    });
    return { pass, upload };
}