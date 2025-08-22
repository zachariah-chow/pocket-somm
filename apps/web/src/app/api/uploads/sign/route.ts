import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';

const s3 = new S3Client({});

export async function POST(req: Request) {
  const { key, contentType } = await req.json().catch(() => ({}));
  if (!key || !contentType) {
    return NextResponse.json(
      { error: 'key and contentType required' },
      { status: 400 },
    );
  }

  // bound by SST linking
  const bucket = Resource.UploadsBucket.name;

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key, // e.g. `uploads/${Date.now()}_${filename}`
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });

  return NextResponse.json({ url, bucket, key });
}
