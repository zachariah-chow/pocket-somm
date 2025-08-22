import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';

const s3 = new S3Client({});
export async function POST(req: Request) {
  const { key, expiresIn = 60 } = await req.json();
  if (!key)
    return NextResponse.json({ error: 'key required' }, { status: 400 });
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: Resource.UploadsBucket.name,
      Key: key,
    }),
    { expiresIn },
  );
  return NextResponse.json({ url });
}
