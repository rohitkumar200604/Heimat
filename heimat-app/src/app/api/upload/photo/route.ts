import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileName, fileType, landlordId } = await req.json();

    const region = process.env.AWS_REGION ?? "eu-central-1";
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    // ── Dev mock fallback ──
    if (!bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json({
        success: true,
        mock: true,
        uploadUrl: `https://mock-s3.amazonaws.com/${landlordId ?? "anon"}/properties/${fileName}?mock=true`,
        key: `${landlordId ?? "anon"}/properties/${fileName}`,
      });
    }

    // ── Production: SigV4 presigned PUT URL ──
    const key = `${landlordId}/properties/${Date.now()}-${fileName}`;
    const expires = 900;

    const host = `${bucket}.s3.${region}.amazonaws.com`;
    const now = new Date();
    const datestamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 8);
    const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");

    const credentialScope = `${datestamp}/${region}/s3/aws4_request`;
    const credential = `${accessKeyId}/${credentialScope}`;

    const queryParams = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": credential,
      "X-Amz-Date": amzdate,
      "X-Amz-Expires": String(expires),
      "X-Amz-SignedHeaders": "host",
    }).toString();

    const canonicalRequest = [
      "PUT", `/${key}`, queryParams, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD",
    ].join("\n");

    const enc = new TextEncoder();
    const hmac = async (keyData: ArrayBuffer | Uint8Array, data: string) => {
      const k = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return crypto.subtle.sign("HMAC", k, enc.encode(data));
    };
    const sha256hex = async (s: string) => {
      const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const stringToSign = ["AWS4-HMAC-SHA256", amzdate, credentialScope, await sha256hex(canonicalRequest)].join("\n");

    const kDate = await hmac(enc.encode(`AWS4${secretAccessKey}`), datestamp);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, "s3");
    const kSigning = await hmac(kService, "aws4_request");
    const sigBuf = await hmac(kSigning, stringToSign);
    const signature = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const uploadUrl = `https://${host}/${key}?${queryParams}&X-Amz-Signature=${signature}`;

    return NextResponse.json({ success: true, uploadUrl, key });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
