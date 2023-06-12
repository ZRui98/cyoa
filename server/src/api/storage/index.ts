import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
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


export function uploadFromStream(filePath: string, user: string): {pass: stream.PassThrough, upload: Upload} {
    var pass = new stream.PassThrough();
    var params = {Bucket: user, Key: filePath, Body: pass};
    const upload = new Upload({
        client: s3,
        leavePartsOnError: true, // optional manually handle dropped parts
        params,
    });
  
    return { pass, upload };
}