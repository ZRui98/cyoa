import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import stream from 'stream';

export const s3 = new S3({
  region: 'us-east-1',
  endpoint: `${process.env.S3_ENDPOINT}`,
  credentials: {
    accessKeyId: `${process.env.ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
  },
  forcePathStyle: true,
});

export function getUserFilePath(user: string, fileName: string, extension='') {
  return `${user}/${fileName}${extension ? `.${extension}` : ''}`;
}

export async function getPresignedUrlForFile(bucket: string, filePath: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: `${bucket}`,
    Key: filePath,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 900 * 60 });
  return url;
}

export function uploadFromStream(
  bucketName: string | undefined,
  filePath: string,
  mimeType: string = 'application/json'
): { pass: stream.PassThrough; upload: Upload } {
  if (!bucketName) {
    throw new Error('Invalid bucket name');
  }
  let pass = new stream.PassThrough();
  let params = { Bucket: bucketName, Key: filePath, Body: pass, ContentType: mimeType, ContentDisposition: 'inline' };
  const upload = new Upload({
    client: s3,
    leavePartsOnError: true, // optional manually handle dropped parts
    params,
  });
  return { pass, upload };
}
