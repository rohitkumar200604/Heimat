import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileName, fileType, landlordId } = await req.json();

    const hasAws =
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME;

    if (!hasAws) {
      // Mock Presigned URL
      return NextResponse.json({
        success: true,
        mock: true,
        uploadUrl: `https://mock-s3-bucket.s3.amazonaws.com/${landlordId}/properties/${fileName}?mock=true`,
        key: `${landlordId}/properties/${fileName}`
      });
    }

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const s3 = new S3Client({
      region: process.env.AWS_REGION || "eu-central-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const key = `${landlordId}/properties/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return NextResponse.json({ success: true, uploadUrl, key });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
