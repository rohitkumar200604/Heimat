import { NextResponse } from "next/server";

/**
 * Document upload presigned URL using GCS Interop (S3-compatible) API.
 * No AWS SDK dependency — uses only native fetch + Web Crypto (SigV4).
 * In dev mode (missing env vars) returns a mock URL immediately.
 */
export async function POST(req: Request) {
  try {
    const { fileName, fileType, userId } = await req.json();

    const bucket = process.env.GCS_BUCKET_NAME;
    const accessKeyId = process.env.GCS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.GCS_SECRET_ACCESS_KEY;

    // ── Dev mock fallback ──
    if (!bucket || !accessKeyId || !secretAccessKey) {
      const key = `${userId ?? "anon"}/docs/${Date.now()}-${fileName}`;
      return NextResponse.json({
        success: true,
        mock: true,
        uploadUrl: `https://storage.googleapis.com/${bucket || "mock-bucket"}/${key}?mock=true`,
        cdnUrl: `https://storage.googleapis.com/${bucket || "mock-bucket"}/${key}`,
        key,
      });
    }

    // ── Production: GCS XML API with SigV4 presigned PUT URL ──
    const key = `${userId}/docs/${Date.now()}-${fileName}`;
    const expires = 900; // 15 minutes

    const host = "storage.googleapis.com";
    const region = "auto";
    const now = new Date();
    const datestamp = now.toISOString().replace(/[:-]|\\.\\d{3}/g, "").slice(0, 8);
    const amzdate = now.toISOString().replace(/[:-]|\\.\\d{3}/g, "");

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
      "PUT",
      `/${bucket}/${key}`,
      queryParams,
      `host:${host}\n`,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const enc = new TextEncoder();

    async function hmac(keyData: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
      const k = await crypto.subtle.importKey("raw", keyData as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return crypto.subtle.sign("HMAC", k, enc.encode(data));
    }

    const sha256hex = async (s: string) => {
      const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const toHex = (buf: ArrayBuffer) =>
      Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzdate,
      credentialScope,
      await sha256hex(canonicalRequest),
    ].join("\n");

    const kDate = await hmac(enc.encode(`AWS4${secretAccessKey}`), datestamp);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, "s3");
    const kSigning = await hmac(kService, "aws4_request");
    const sigBuf = await hmac(kSigning, stringToSign);
    const signature = toHex(sigBuf);

    const uploadUrl = `https://${host}/${bucket}/${key}?${queryParams}&X-Amz-Signature=${signature}`;
    const cdnUrl = `https://${host}/${bucket}/${key}`;

    return NextResponse.json({ success: true, uploadUrl, cdnUrl, key });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
